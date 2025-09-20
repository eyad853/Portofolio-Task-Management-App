import React, { useEffect, useState } from 'react';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import Modal from "react-modal";
import ColorWheel from '../ColorWheel/ColorWheel';
import axios from 'axios';

const ColumnsModal = ({setColumns, isColumnsModalOpen, selectedColumn , setSelectedColumn, darkMode, fetchColumns, setIsColumnsModalOpen, pages ,selectedPageId}) => {
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [name, setName] = useState("");
    const [status , setStatus]=useState("")
    const kanbanPage = pages.find(page => page._id === selectedPageId)
        if (!kanbanPage) return console.error("Kanban page not found");

    const setupUpdatedData = () => {
        if (selectedColumn) {
            setName(selectedColumn?.name || '');
            setSelectedColor(selectedColumn?.color || '#000000');
            setStatus(selectedColumn.status ||"")
        }
    };

    // When the modal opens and selectedColumn is null or undefined, reset fields for new column
    useEffect(() => {
        if (isColumnsModalOpen) {
            if (selectedColumn) {
                setupUpdatedData();
            } else {
                // Reset state for creating a new column
                setName('');
                setSelectedColor('#000000');
            }
        }
    }, [isColumnsModalOpen, selectedColumn]); // Trigger when modal open or selectedColumn changes

    const updateColumn = async (columnId) => {
        const updatedFields = {};

        if (name !== selectedColumn.name) {
            updatedFields.name = name;
        }
        if (status !== selectedColumn.status) {
            updatedFields.status = status;
        }

        if (selectedColor !== selectedColumn.color) {
            updatedFields.color = selectedColor;
        }

        if (Object.keys(updatedFields).length === 0) {
            console.log("No fields were changed.");
            return; // Don't send request if nothing changed
        }

        try {
            setColumns(prev=>prev.map(col=>col._id===columnId?{...col , ...updatedFields}:col))
            setIsColumnsModalOpen(false)
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/updateColumnSettings/${kanbanPage._id}/${columnId}`,
                updatedFields
            );
                setSelectedColumn(null)
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const addColumn = async () => {
        const column = {
            _id: crypto.randomUUID(),
            name,
            color: selectedColor,
            cards: [],
            status,
            createdAt: new Date()
        };

        try {
            setColumns(prev=>[...prev , column])
            setIsColumnsModalOpen(false);
            setName('');
            setSelectedColor('#000000');
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/updatePage/${kanbanPage._id}`, {
                column
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = () => {
        if (selectedColumn) {
            updateColumn(selectedColumn._id); // Update the column if selectedColumn exists
        } else {
            addColumn(); // Add a new column if no column is selected
        }
    };

    return (
        <Modal
            isOpen={isColumnsModalOpen}
            onRequestClose={() =>{ 
                setIsColumnsModalOpen(false)
                setSelectedColumn(null)
            }}
            className={`w-[95vw] sm:w-[90vw] md:w-170 h-auto max-h-[90vh] ${darkMode ? "bg-gray-800 text-white" : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 overflow-y-auto`}
            overlayClassName="fixed inset-0 bg-gray-300/50 z-50 flex justify-center items-center px-2 sm:px-0"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className='w-full h-full flex flex-col lg:flex-row'>
                <div className="w-full lg:w-2/3 flex gap-3 sm:gap-4 flex-col justify-center h-full lg:mr-2 mb-4 lg:mb-0">
                    <div className='border border-gray-400 flex items-center rounded-md w-full h-10 sm:h-12'>
                        <div className='w-12 sm:w-16 h-full flex justify-center rounded-lmd items-center text-sm sm:text-base'>
                            <MdDriveFileRenameOutline />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={({ target }) => {
                                setName(target.value);
                            }}
                            className={`w-full h-full ${darkMode ? " text-white" : ''} rounded-md outline-none px-2 text-sm sm:text-base`}
                            placeholder='Column Name'
                        />
                    </div>

                    <div className="w-full h-auto my-3 sm:my-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div 
                        onClick={()=>{
                            setStatus('todo')
                        }}
                        className={`flex-1 sm:w-auto h-10 sm:h-12 rounded-md flex justify-center items-center ${status==='todo'?"bg-blue-600 text-white":"border border-neutral-400"} transition-all duration-300 cursor-pointer text-sm sm:text-base`}>To-do</div>
                        <div 
                        onClick={()=>{
                            setStatus('onProgress')
                        }}
                        className={`flex-1 sm:w-auto h-10 sm:h-12 rounded-md flex justify-center items-center ${status==='onProgress'?"bg-blue-600 text-white":"border border-neutral-400"} transition-all duration-300 cursor-pointer text-sm sm:text-base`}>In Progress</div>
                        <div 
                        onClick={()=>{
                            setStatus('done')
                        }}
                        className={`flex-1 sm:w-auto h-10 sm:h-12 rounded-md flex justify-center items-center ${status==='done'?"bg-blue-600 text-white":"border border-neutral-400"} transition-all duration-300 cursor-pointer text-sm sm:text-base`}>Done</div>
                    </div>

                    <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-0'>
                        <div className='flex font-semibold items-center justify-center w-full sm:w-32 h-auto sm:h-14 text-sm sm:text-base'>
                            Column Color :
                        </div>
                        <div
                            className={`w-full sm:flex-1 h-12 sm:h-14 rounded-md border border-gray-300`}
                            style={{ backgroundColor: selectedColor }}
                        >
                        </div>
                    </div>

                    <div
                        onClick={handleSubmit}
                        className='w-full sm:w-40 h-10 sm:h-12 rounded-md transform cursor-pointer hover:scale-105 transition-all duration-200 font-semibold mx-auto mt-3 sm:mt-5 flex justify-center items-center bg-blue-600 text-white text-sm sm:text-base'>
                        {selectedColumn ? "Update Column" : 'Add Column'}
                    </div>
                </div>

                <div className='w-full lg:w-1/3 h-60 sm:h-80 lg:h-full flex justify-center items-center'>
                    <ColorWheel type="column" selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                </div>
            </div>
        </Modal>
    );
};

export default ColumnsModal;