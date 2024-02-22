import React, { useState } from 'react';

const DeleteFilePopup = ({ file, onDelete }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Function to handle file deletion and confirmation
    const handleDelete = () => {
        onDelete(file.fileName); // Call the onDelete function with the fileName
        setConfirmDelete(false); // Reset confirmDelete state
    };

    return (
        <div>
            <button onClick={() => setConfirmDelete(true)}>Delete</button>
            {/* Display confirmation dialog if confirmDelete is true */}
            {confirmDelete && (
                <div>
                    <p>Are you sure you want to delete {file.fileName}?</p>
                    <button onClick={handleDelete}>Yes</button>
                    <button onClick={() => setConfirmDelete(false)}>No</button>
                </div>
            )}
        </div>
    );
};

export default DeleteFilePopup;
