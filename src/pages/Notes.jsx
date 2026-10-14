import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiTrash2 } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

import {
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';

import { db } from '../firebase';

import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';

import toast from 'react-hot-toast';

const departments = [
  'All',
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'IT'
];

const semesters = [
  'All',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8'
];

const Notes = () => {

  const { currentUser, userProfile, isAdmin } = useAuth();

  const {
    docs: notes,
    loading
  } = useFirestore(
    'notes',
    [],
    {
      field: 'createdAt',
      direction: 'desc'
    }
  );

  const [search, setSearch] = useState('');

  const [dept, setDept] = useState('All');

  const [sem, setSem] = useState('All');

  const [showUpload, setShowUpload] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    semester: '',
    department: ''
  });

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({

      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.png', '.jpg', '.jpeg']
      },

      maxFiles: 1,

      onDrop: acceptedFiles => {
        setFile(acceptedFiles[0]);
      }

    });

  // CLOUDINARY UPLOAD
  const uploadToCloudinary = async (file) => {

    const data = new FormData();

    data.append('file', file);

    data.append(
      'upload_preset',
      'campus_notes'
    );

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dpredkdvg/auto/upload',
      {
        method: 'POST',
        body: data
      }
    );

    const uploadedData = await response.json();

    if (!uploadedData.secure_url) {
      throw new Error('Cloudinary upload failed');
    }

    return uploadedData.secure_url;
  };

  // DELETE NOTE
  const handleDelete = async (id) => {

    try {

      await deleteDoc(doc(db, 'notes', id));

      toast.success('Note deleted successfully');

    } catch (error) {

      console.log(error);

      toast.error('Delete failed');

    }

  };

  // HANDLE NOTE UPLOAD
  const handleUpload = async (e) => {

    e.preventDefault();

    if (!file) {
      return toast.error('Please select a file');
    }

    if (
      !uploadForm.title ||
      !uploadForm.subject ||
      !uploadForm.department ||
      !uploadForm.semester
    ) {
      return toast.error('Please fill all fields');
    }

    try {

      setUploading(true);

      const fileURL =
        await uploadToCloudinary(file);

      // Extract file type/extension for UI styling
      const fileExt = file.name.split('.').pop().toLowerCase();
      let fileType = 'default';
      if (fileExt === 'pdf') {
        fileType = 'pdf';
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
        fileType = 'image';
      } else if (['doc', 'docx', 'txt', 'rtf'].includes(fileExt)) {
        fileType = 'doc';
      }

      await addDoc(
        collection(db, 'notes'),
        {
          ...uploadForm,

          fileURL,

          fileName: file.name,
          fileType,

          uploadedBy: currentUser?.uid,

          uploaderEmail: currentUser?.email,

          uploaderName:
            userProfile?.name || 'Student',

          createdAt: serverTimestamp()
        }
      );

      toast.success(
        'Notes uploaded successfully 🎉'
      );

      setShowUpload(false);

      setFile(null);

      setUploadForm({
        title: '',
        subject: '',
        semester: '',
        department: ''
      });

    } catch (error) {

      console.error(error);

      toast.error(
        error.message || 'Upload failed'
      );

    } finally {

      setUploading(false);

    }

  };

  // FILTER NOTES
  const filteredNotes = notes.filter(note => {

    const matchSearch =
      note.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      note.subject
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchDept =
      dept === 'All' ||
      note.department === dept;

    const matchSem =
      sem === 'All' ||
      note.semester === sem;

    return (
      matchSearch &&
      matchDept &&
      matchSem
    );

  });

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-black text-white">
            Study Notes
          </h1>

          <p className="text-slate-400 text-sm">
            Upload and share study materials
          </p>

        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
        >
          Upload Notes
        </button>

      </div>

      {/* SEARCH */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search notes..."
      />

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">

        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white"
        >

          {departments.map(dep => (
            <option key={dep}>
              {dep}
            </option>
          ))}

        </select>

        <select
          value={sem}
          onChange={e => setSem(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white"
        >

          {semesters.map(s => (
            <option key={s}>
              {s === 'All'
                ? 'All'
                : `Sem ${s}`}
            </option>
          ))}

        </select>

      </div>

      {/* NOTES LIST */}
      {loading ? (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader count={6} />
        </div>

      ) : filteredNotes.length === 0 ? (

        <div className="text-center py-16 text-slate-400">

          <FiUpload className="mx-auto text-4xl mb-3" />

          <p>No notes uploaded yet</p>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredNotes.map(note => (

            <div
              key={note.id}
              className="relative"
            >

              <NoteCard note={note} />

              {(note.uploaderEmail === currentUser?.email || isAdmin) && (

                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >

                  <FiTrash2 />

                </button>

              )}

            </div>

          ))}

        </div>

      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>

        {showUpload && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg"
            >

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold text-white">
                  Upload Notes
                </h2>

                <button
                  onClick={() => setShowUpload(false)}
                  className="text-white"
                >
                  <FiX />
                </button>

              </div>

              <form
                onSubmit={handleUpload}
                className="space-y-4"
              >

                <input
                  type="text"
                  placeholder="Note Title"
                  value={uploadForm.title}
                  onChange={e =>
                    setUploadForm({
                      ...uploadForm,
                      title: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white"
                />

                <input
                  type="text"
                  placeholder="Subject"
                  value={uploadForm.subject}
                  onChange={e =>
                    setUploadForm({
                      ...uploadForm,
                      subject: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white"
                />

                <div className="grid grid-cols-2 gap-3">

                  <select
                    value={uploadForm.department}
                    onChange={e =>
                      setUploadForm({
                        ...uploadForm,
                        department: e.target.value
                      })
                    }
                    className="px-4 py-3 rounded-xl bg-slate-800 text-white"
                  >

                    <option value="">
                      Department
                    </option>

                    {departments
                      .filter(d => d !== 'All')
                      .map(dep => (
                        <option key={dep}>
                          {dep}
                        </option>
                      ))}

                  </select>

                  <select
                    value={uploadForm.semester}
                    onChange={e =>
                      setUploadForm({
                        ...uploadForm,
                        semester: e.target.value
                      })
                    }
                    className="px-4 py-3 rounded-xl bg-slate-800 text-white"
                  >

                    <option value="">
                      Semester
                    </option>

                    {semesters
                      .filter(s => s !== 'All')
                      .map(s => (
                        <option
                          key={s}
                          value={s}
                        >
                          Sem {s}
                        </option>
                      ))}

                  </select>

                </div>

                {/* FILE DROP */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-slate-700'
                  }`}
                >

                  <input {...getInputProps()} />

                  {file ? (

                    <p className="text-white">
                      {file.name}
                    </p>

                  ) : (

                    <>

                      <FiUpload className="mx-auto text-3xl text-slate-400 mb-3" />

                      <p className="text-slate-400">
                        Drop PDF, DOCX or Image
                      </p>

                    </>

                  )}

                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold"
                >

                  {uploading
                    ? 'Uploading...'
                    : 'Upload Notes'}

                </button>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

};

export default Notes;