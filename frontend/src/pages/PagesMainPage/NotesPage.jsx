import React, { useEffect, useRef, useState, Fragment } from 'react'
import ViewModal from '../../components/Modals/ViewModal';
import NotesModal from '../../components/Modals/NotesModal';
// Removed unused imports: ColumnsModal, CartsModal
import axios from 'axios'
// Removed react-icons/fa and react-icons/fa6 imports from here, using inline SVGs
import { Listbox, Transition } from '@headlessui/react' // Import Listbox and Transition

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  // horizontalListSortingStrategy, // This seems unused, verticalListSortingStrategy is more common for notes
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Create a sortable note component
const SortableNote = ({ note, onSelect, onDelete, darkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: note._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 999 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${darkMode ? "bg-gray-900" : "bg-white"} border shadow-2xl rounded-2xl flex flex-col px-3 sm:px-4 pb-2 relative w-full`}
    >
      <div
        onClick={() => onSelect(note)}
        className="cursor-pointer w-full h-full pt-3"
      >
        {/* Title and drag handle in one line */}
        <div className='w-full h-10 flex items-center justify-between'>
          <div className="font-bold text-lg sm:text-xl md:text-2xl truncate pr-2 flex-1">
            {note.title}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-all duration-200 flex-shrink-0 touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FaGripVertical replaced with inline SVG */}
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className='w-full h-auto max-h-32 sm:max-h-40 font-medium sm:font-semibold flex-1 overflow-hidden'>
          <div className='line-clamp-4 sm:line-clamp-5 text-sm sm:text-base'>
            {note.content}
          </div>
        </div>

        <div className='flex justify-between items-center'>
          {/* Category */}
          <div className='flex-1 h-10 flex mt-2.5 items-center overflow-x-auto hide-scrollbar'>
            {note.category && note.category.length > 0 ? note.category.map((cat) => (
              <div key={cat} className={`px-2 sm:px-3 py-1.5 sm:py-2 mr-1.5 sm:mr-2 ${darkMode ? "bg-gray-900 border-white" : "bg-gray-100 border-gray-300"} text-xs sm:text-sm rounded-md border border-gray-300 whitespace-nowrap`}>
                {cat}
              </div>
            )) : null}
          </div>
          <div className='h-10 mt-2.5 w-10 flex justify-end items-center flex-shrink-0'>
            {/* FaTrash replaced with inline SVG */}
            <svg
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note._id);
              }}
              className='hover:text-red-600 mr-1 transition-all duration-200 h-4 w-4 sm:h-5 sm:w-5 cursor-pointer touch-manipulation'
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotesPage = ({ pages, darkMode, isSideBarOpen, selectedPageId }) => {
  const [notes, setNotes] = useState([]);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewNote, setViewNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  // New state for category filter
  const [filterCategory, setFilterCategory] = useState('all');
  // State to track if any Listbox is open for scrollbar management

  // Ensure 'pages' is an array before trying to find an element in it.
  const notesPage = Array.isArray(pages) ? pages.find(page => page._id === selectedPageId) : undefined;

  // Handle the case where notesPage is not found or pages is not an array.
  // This return statement will prevent any further execution that relies on notesPage.
  if (!notesPage) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center px-4 ${darkMode ? "text-white" : "text-gray-500"}`}>
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        ) : (
          <>
            {/* MdOutlineNotes replaced with inline SVG */}
            <svg className="h-12 w-12 sm:h-16 sm:w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-lg sm:text-xl text-center">No notes page selected or found.</p>
            <p className="mt-2 text-center text-sm sm:text-base">Please select a valid page.</p>
          </>
        )}
      </div>
    );
  }

  useEffect(() => {
    setNotes([])
  }, [selectedPageId])

  // Configure DnD sensors with better touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased distance for better touch experience
        delay: 100,  // Add slight delay for touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchNotes = async () => {
    setLoading(true);

    // notesPage is guaranteed to be defined here due to the early return above
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getSpecificPage/${notesPage._id}`);
      if (response.data && response.data.page && response.data.page.content) {
        setNotes(response.data.page.content.notes || []);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setError("Failed to load notes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const saveNotesOrder = async (updatedNotes) => {
    if (!notesPage) return; // This check is still good to have, though less likely to be hit now

    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/updateNotesOrders/${notesPage._id}`, {
        notes: updatedNotes
      });
      if (response) {
        console.log(response.data);
      }
    } catch (error) {
      console.error("Failed to save notes order:", error);
      setError("Failed to save notes order. Please try again.");
    }
  };

  useEffect(() => {
    // The initial check for notesPage is now done at the top of the component,
    // so this useEffect can directly proceed with fetching if notesPage is valid.
    fetchNotes();
  }, [pages, notesPage, selectedPageId]); // Keep dependencies for re-fetching on page/selection change

  const deleteNote = async (noteId) => {
    if (!notesPage) return;

    try {
      setNotes(notes.filter(note => note._id !== noteId))
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/deleteItem/${notesPage._id}/${noteId}`);
    } catch (error) {
      console.error("Failed to delete note:", error);
      setError("Failed to delete note. Please try again.");
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveNote(notes.find(note => note._id === active.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveNotesOrder(newOrder); // Save new order to database
        return newOrder;
      });
    }

    setActiveId(null);
    setActiveNote(null);
  };

  // Dynamically generate category options from existing notes
  const allCategories = ['all', ...new Set(notes.flatMap(note => note.category || []))];
  const categoryOptions = allCategories.map(cat => ({
    id: cat,
    name: cat === 'all' ? 'All Categories' : cat,
  }));

  // Filtered notes based on selected category
  const filteredNotes = notes.filter(note => {
    if (filterCategory === 'all') {
      return true; // Show all notes if no category filter is applied
    }
    // Check if the note has the selected category
    return note.category && note.category.includes(filterCategory);
  });

  return (
    <div className={`w-full ${darkMode ? "text-white" : ""} h-full px-4 sm:px-6  pb-6 lg:pb-10 flex flex-col`}>
      {/* Header section */}
      <div className='w-full h-auto sm:h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0'>
        <div className='text-xl sm:text-2xl lg:text-3xl font-bold ml-0 sm:ml-5 mt-2 border-b border-gray-300 flex-shrink-0'>
          {notesPage.name} {/* notesPage is guaranteed to be defined here */}
        </div>
        <div className='w-full sm:w-auto flex justify-center sm:justify-end mt-2 items-center'>
          <div
            onClick={() => setIsNotesModalOpen(true)}
            className={`w-full sm:w-36 max-w-xs transform hover:scale-105 transition-all duration-200 sm:mr-10 rounded-md h-10 ${darkMode ? "bg-white text-black" : "bg-black text-white"} font-bold flex gap-2 sm:gap-3 justify-center items-center text-sm cursor-pointer touch-manipulation`}
          >
            {/* FaPlus replaced with inline SVG */}
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="whitespace-nowrap">Add new Note</span>
          </div>
        </div>
      </div>

      {/* ViewModal with editing capabilities */}
      <ViewModal
        viewNote={viewNote}
        setViewNote={setViewNote}
        selectedNote={selectedNote}
        darkMode={darkMode}
        fetchNotes={fetchNotes}
        notesPage={notesPage}
        setNotes={setNotes}
      />

      <NotesModal
        isNotesModalOpen={isNotesModalOpen}
        setIsNotesModalOpen={setIsNotesModalOpen}
        pages={pages}
        fetchNotes={fetchNotes}
        darkMode={darkMode}
        selectedPageId={selectedPageId}
        setNotes={setNotes}
      />

      {loading ? (
        <div className="w-full flex justify-center items-center py-10 sm:py-20">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className={`w-full mt-4 sm:mt-5 items-start`}>
          {error && (
            <div className="w-full p-3 sm:p-4 mb-4 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
              {error}
            </div>
          )}

          {filteredNotes.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredNotes.map(note => note._id)}
                strategy={rectSortingStrategy}
              >
                {/* Responsive grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 sm:gap-6 lg:gap-10 items-start justify-center sm:justify-start">
                  {filteredNotes.map((note) => (
                    <SortableNote
                      key={note._id}
                      note={note}
                      onSelect={(note) => {
                        setSelectedNote(note);
                        setViewNote(true);
                      }}
                      onDelete={deleteNote}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div
                    className={`${darkMode ? "bg-gray-950" : "bg-white"} border shadow-2xl rounded-2xl flex flex-col px-3 sm:px-4 pb-2 w-64 sm:w-72`}
                  >
                    <div className='w-full h-10 flex items-center pt-3'>
                      <div className="font-bold text-lg sm:text-xl lg:text-2xl">{activeNote?.title}</div>
                    </div>
                    <div className='w-full font-medium sm:font-semibold flex-1 overflow-hidden'>
                      <div className='line-clamp-3 sm:line-clamp-4 text-sm sm:text-base'>{activeNote?.content}</div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-500 px-4">
              <div className='text-4xl sm:text-6xl'>
                {/* MdOutlineNotes replaced with inline SVG */}
                <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-lg sm:text-xl text-center">No notes yet</p>
              <p className="mt-2 text-center text-sm sm:text-base">Click "Add new Note" to create your first note</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;