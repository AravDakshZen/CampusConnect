import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Hook to upload a file to Firebase Storage with progress tracking
 */
const useStorage = () => {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);

    const upload = async (file, path) => {
        setUploading(true);
        setError(null);
        setProgress(0);
        try {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            const downloadURL = await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setProgress(Math.round(pct));
                    },
                    (err) => reject(err),
                    async () => {
                        try {
                            const result = await getDownloadURL(storageRef);
                            resolve(result);
                        } catch (err) {
                            reject(err);
                        }
                    },
                );
            });

            setUrl(downloadURL);
            return downloadURL;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return { upload, progress, uploading, error, url };
};

export default useStorage;
