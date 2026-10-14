import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from "../firebase";

/**
 * Subscribe to a Firestore collection in real-time
 * @param {string} collectionName
 * @param {Array} conditions - [{field, operator, value}]
 * @param {object} ordering - {field, direction}
 */
const useFirestore = (collectionName, conditions = [], ordering = null) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        try {
            let q = collection(db, collectionName);
            const constraints = [];

            conditions.forEach((condition) => {
                constraints.push(where(condition.field, condition.operator, condition.value));
            });

            if (ordering) {
                constraints.push(orderBy(ordering.field, ordering.direction || 'asc'));
            }

            const unsubscribe = onSnapshot(query(q, ...constraints), (snapshot) => {
                setDocs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            }, (err) => {
                setError(err.message);
                setLoading(false);
            });

            return unsubscribe;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName]);

    return { docs, loading, error };
};

export default useFirestore;
