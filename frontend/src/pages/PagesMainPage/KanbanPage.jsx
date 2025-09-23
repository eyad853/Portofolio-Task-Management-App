import React, { useEffect, useRef, useState, Fragment } from 'react' // Added Fragment here
import ColumnsModal from '../../components/Modals/ColumnsModal'
import CartsModal from '../../components/Modals/CartsModal'
import axios from 'axios'
import { Listbox, Transition } from '@headlessui/react' // Added Transition here

import {
  DndContext,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  PointerSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import SortableCard from '../../components/SortableCard/SortableCard'
import { CSS } from '@dnd-kit/utilities'

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',

      },
    },
  }),
};

// Create a SortableColumn component for the draggable columns
const SortableColumn = ({setSelectedColumn, column,setIsColumnsModalOpen, setOpenSettingsColumnId, deleteColumn, children, darkMode, onSettingsClick, isSettingsOpen, onAddCard }) => {
  const columnSettingsRef=useRef(null)

  useEffect(() => {
    const clickOutsideColumn = (e) => {
      if (columnSettingsRef.current && !columnSettingsRef.current.contains(e.target)) {
        setOpenSettingsColumnId(null);
      }
    };

    document.addEventListener('mousedown', clickOutsideColumn); // Using mousedown instead of click

    return () => {
      document.removeEventListener('mousedown', clickOutsideColumn);
    };
  }, [setOpenSettingsColumnId]); // Add the dependency



  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: column.color,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl px-2 sm:px-3 pb-2.5 ${column.color === "#000000" ? "text-white" : ""} relative flex flex-col`}
    >
      {/* Column header - make this the drag handle */}
      <div
        className='flex h-10 w-full mt-3 justify-between items-center cursor-grab active:cursor-grabbing touch-manipulation'
        {...attributes}
        {...listeners}
      >
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold line-clamp-1">{column.name}</div>
        <div className="relative">
          {/* FaEllipsis replaced with inline SVG */}
          <svg
            onClick={(e) => {
              e.stopPropagation()
              onSettingsClick(column._id)
            }}
            className="cursor-pointer h-5 w-5 touch-manipulation"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          {isSettingsOpen === column._id && (
            <div
            ref={columnSettingsRef}
              className={`absolute w-32 z-50 -left-16 rounded-md flex flex-col h-24 ${darkMode?"bg-gray-900":"bg-white text-black"} border border-neutral-500`}>
              <div
              onClick={()=>{
                setIsColumnsModalOpen(true)
                setSelectedColumn(column)
              }}
                className={`w-full flex justify-center items-center transition-all duration-200 hover:text-blue-500 hover:${darkMode?"bg-gray-950":"bg-gray-200"} cursor-pointer font-semibold h-1/2 border-b border-neutral-400 text-sm`}>
                update Column
              </div>
              <div
              onClick={()=>{
                deleteColumn(column._id)
              }}
                className={`w-full flex justify-center items-center transition-all duration-200 hover:text-red-600 hover:${darkMode?"bg-gray-950":"bg-gray-200"} cursor-pointer font-semibold h-1/2 text-sm`}
              >
                delete Column
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Card button */}
      <div
        onClick={() => onAddCard(column)}
        className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-md z-10 right-2 sm:right-4 bottom-2 sm:bottom-4 transform hover:scale-105 transition-all duration-200 text-black bg-white border border-neutral-400 flex justify-center items-center cursor-pointer touch-manipulation`}
      >
        {/* FaPlus replaced with inline SVG */}
        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 sm:space-y-3 mt-3">
        {children}
      </div>
    </div>
  );
};

const KanbanPage = ({isFriendsModalOpen, isSideBarOpen, darkMode, pages, setIsFriendsModalOpen , selectedPageId}) => {
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false)
  const [isCartsModalOpen, setIsCartsModalOpen] = useState(false)
  const [columns, setColumns] = useState([])
  const [openSettingsColumnId, setOpenSettingsColumnId] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedCard , setSelectedCard]=useState(null)
  const [activeCardId, setActiveCardId] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'todo', 'onProgress', 'done'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'low', 'medium', 'high'
  const [loading , setLoading]=useState(false)

  // Options for the status filter Listbox - ADDED THESE
  const statusOptions = [
    { id: 'all', name: 'All Statuses' },
    { id: 'todo', name: 'Todo' },
    { id: 'onProgress', name: 'On Progress' },
    { id: 'done', name: 'Done' },
  ];

  // Options for the priority filter Listbox - ADDED THESE
  const priorityOptions = [
    { id: 'all', name: 'All Priorities' },
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' },
  ];


  const filteredColumns = columns.map(column => {
  // Filter cards within each column based on priority
  const filteredCards = column.cards.filter(card => {
    if (filterPriority === 'all') {
      return true; // Show all cards if no priority filter is applied
    }
    return card.priority === filterPriority;
  });

  return {
    ...column,
    cards: filteredCards
  };
}).filter(column => {
  // Filter columns based on status
  if (filterStatus === 'all') {
    return true; // Show all columns if no status filter is applied
  }
  return column.status === filterStatus;
});


  const settingsRef = useRef(null);

  const kanbanPage = pages.find(page => page._id === selectedPageId)
  if (!kanbanPage) return console.error("kanbanPage page not found")

    useEffect(()=>{
    setColumns([])
  },[selectedPageId])

  const fetchColumns = async() => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getSpecificPage/${kanbanPage._id}`);
      if (response.data && response.data.page && response.data.page.content.columns) {
        console.log(response.data.page.content.columns);
        setColumns(response.data.page.content.columns || []);
      }
    } catch(error) {
      console.log(error);
    }finally{
      setLoading(false)
    }
  }
  const deleteColumn = async(columnId)=>{
    try{
      setColumns(prev=>prev.filter(column=>column._id!==columnId))
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/deleteItem/${kanbanPage._id}/${columnId}`);
    }catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    fetchColumns()
  }, [selectedPageId])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setOpenSettingsColumnId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const saveColumnsToDatabase = async(updatedColumns) => {
    try {
      // Implement saving to your database
      const response =await axios.put(`${import.meta.env.VITE_BACKEND_URL}/updateColumnsOrders/${kanbanPage._id}`, {
        columns: updatedColumns
      });
      if(response){
        console.log(response.data);
      }
    } catch(error) {
      console.log("Error saving columns:", error);
    }
  }

  // Enhanced sensors for better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased for better touch experience
        delay: 100, // Add delay for touch devices
      },
    })
  );

  // Find column containing a card
  const findColumnContainingCard = (cardId) => {
    return columns.find(column =>
      column.cards.some(card => card._id === cardId)
    );
  };

  // Find card in any column
  const findCard = (cardId) => {
    for (const column of columns) {
      const card = column.cards.find(card => card._id === cardId);
      if (card) return card;
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;

    // Check if we're dragging a card
    const activeColumn = findColumnContainingCard(active.id);
    if (activeColumn) {
      setIsDraggingCard(true);
      setActiveCardId(active.id);
      setActiveCard(findCard(active.id));
      return;
    }

    // Check if we're dragging a column
    const column = columns.find(col => col._id === active.id);
    if (column) {
      setIsDraggingColumn(true);
      setActiveColumnId(active.id);
      setActiveColumn(column);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (isDraggingCard) {
      handleCardDragEnd(active, over);
    } else if (isDraggingColumn) {
      handleColumnDragEnd(active, over);
    }

    // Reset active states
    setActiveCardId(null);
    setActiveCard(null);
    setActiveColumnId(null);
    setActiveColumn(null);
    setIsDraggingCard(false);
    setIsDraggingColumn(false);
  };

  const handleCardDragEnd = (active, over) => {
    if (!active || !over) return;

    // Find source column (which contains the dragged card)
    const sourceColumnIndex = columns.findIndex(column =>
      column.cards.some(card => card._id === active.id)
    );

    if (sourceColumnIndex === -1) return;

    // Create a deep copy to avoid direct state mutations
    const updatedColumns = JSON.parse(JSON.stringify(columns));

    // Get the active card
    const activeCard = updatedColumns[sourceColumnIndex].cards.find(
      card => card._id === active.id
    );

    // First, check if we're dropping on another card
    const overCardColumn = updatedColumns.findIndex(column =>
      column.cards.some(card => card._id === over.id)
    );

    if (overCardColumn !== -1) {
      // We're dropping on a card, find its position
      const overCardIndex = updatedColumns[overCardColumn].cards.findIndex(
        card => card._id === over.id
      );

      // Remove card from source column
      updatedColumns[sourceColumnIndex].cards = updatedColumns[sourceColumnIndex].cards.filter(
        card => card._id !== active.id
      );

      // Add card to target column at the right position
      updatedColumns[overCardColumn].cards.splice(overCardIndex, 0, activeCard);

      setColumns(updatedColumns);
      saveColumnsToDatabase(updatedColumns);
      return;
    }

    // If we didn't drop on a card, check if we dropped in a column
    // For simplicity, if no specific drop target is identified, return the card to its source
    const targetColumnId = over.id;
    const targetColumnIndex = updatedColumns.findIndex(column => column._id === targetColumnId);

    if (targetColumnIndex !== -1) {
      // Remove from source
      updatedColumns[sourceColumnIndex].cards = updatedColumns[sourceColumnIndex].cards.filter(
        card => card._id !== active.id
      );

      // Add to target (at the end)
      updatedColumns[targetColumnIndex].cards.push(activeCard);

      setColumns(updatedColumns);
      saveColumnsToDatabase(updatedColumns);
    }
  };

  const handleColumnDragEnd = (active, over) => {
    if (!active || !over || active.id === over.id) return;

    const oldIndex = columns.findIndex(col => col._id === active.id);
    const newIndex = columns.findIndex(col => col._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);
      saveColumnsToDatabase(newColumns);
    }
  };

  // Better collision detection that handles moving cards up and down
  const collisionDetectionStrategy = (args) => {
    // First try pointer collision - most intuitive for users
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Then check for rectangular intersections
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // Finally fall back to closest corners algorithm
    // This is especially helpful for moving items up in a list
    return closestCorners(args);
  };

  // Prepare all card IDs for the sortable context
  const allCardIds = columns.flatMap(column =>
    column.cards.map(card => card._id)
  );

  // Get column IDs for column dragging
  const columnIds = columns.map(column => column._id);

  

  return (
    <div className={`w-full h-full flex flex-col px-4 sm:px-6  pb-3 sm:pb-5 ${darkMode?"text-white":""}`}>
      {/* Header section */}
      <div className='w-full h-auto sm:h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0'>
        <div className='text-xl sm:text-2xl lg:text-3xl font-bold ml-0 sm:ml-5 mt-2 border-b border-gray-300'>
          {kanbanPage.name}
        </div>
        <div className="flex gap-3 sm:gap-5 w-full sm:w-auto justify-center sm:justify-end">
          <div className='w-full sm:w-auto flex justify-center sm:justify-between mt-2 gap-3 sm:gap-5 items-center'>
            {/* Add new column button */}
            <div
              onClick={() => setIsColumnsModalOpen(true)}
              className={`w-full sm:w-44 max-w-xs cursor-pointer transform hover:scale-105 transition-all duration-200 sm:mr-10 rounded-md h-10 ${darkMode?"bg-white text-black":"bg-black text-white"} font-bold flex gap-2 sm:gap-3 justify-center items-center text-sm touch-manipulation`}>
              {/* FaPlus replaced with inline SVG */}
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="whitespace-nowrap">add new column</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban board with columns and cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Make columns draggable */}
        <SortableContext items={columnIds} strategy={rectSortingStrategy}>
          <div className={`w-full flex-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,_minmax(300px,1fr))] gap-4 md:gap-10 auto-rows-[32rem] md:auto-rows-[37.6rem] mt-4 md:mt-5`}>
            {filteredColumns.length > 0 ? (
              filteredColumns.map((column) => (
                <SortableColumn
                  key={column._id}
                  setIsColumnsModalOpen={setIsColumnsModalOpen}
                  column={column}
                  darkMode={darkMode}
                  onSettingsClick={(id) => setOpenSettingsColumnId(prev => prev === id ? null : id)}
                  isSettingsOpen={openSettingsColumnId}
                  setOpenSettingsColumnId={setOpenSettingsColumnId}
                  deleteColumn={deleteColumn}
                  onAddCard={(col) => {
                    setIsCartsModalOpen(true);
                    setSelectedColumn(column);
                  }}
                  setSelectedColumn={setSelectedColumn}
                >
                  {/* Make cards within this column draggable */}
                  <SortableContext items={column.cards.map(card => card._id)} strategy={verticalListSortingStrategy}>
                    {column.cards.length > 0 ? (
                      column.cards.map((card) => (
                        <SortableCard setColumns={setColumns} column={column} selectedColumn={selectedColumn} setSelectedColumn={setSelectedColumn} fetchColumns={fetchColumns} kanbanPage={kanbanPage} darkMode={darkMode} card={card} key={card._id} />
                      ))
                    ) : (
                      <div className='flex-1 w-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold text-white'>
                        <div className='border-b border-white pb-2 text-center'>
                          Start by adding a card
                        </div>
                      </div>
                    )}
                  </SortableContext>
                </SortableColumn>
              ))
            ) : (
              <div className='w-full h-full col-span-full flex flex-col items-center justify-center text-gray-500'>
                <div className='text-4xl sm:text-6xl mb-4'>
                  {/* Kanban board icon */}
                  <svg className="h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-lg sm:text-xl text-center">No columns yet</p>
                <p className="mt-2 text-center text-sm sm:text-base">Click "add new column" to get started</p>
              </div>
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay - Shows either a card or a column while dragging */}
        <DragOverlay dropAnimation={dropAnimation} zIndex={1000}>
          {isDraggingCard && activeCard ? (
            <div
              style={{
                backgroundColor: activeCard.color,
              }}
              className={`cursor-grabbing border-2 ${activeCard.color === "#000000" ? "border-white text-white" : "border-black"} flex flex-col relative h-36 sm:h-43 shadow-2xl rounded-md pt-1 px-1 pb-2`}
            >
              <div className="w-full flex items-center justify-between h-6 sm:h-8">
                <div className='font-semibold h-full flex-1 overflow-x-auto hide-scrollbar text-lg sm:text-xl'>
                  {activeCard.title}
                </div>
                <div className='w-4 h-4 sm:w-5 sm:h-5 flex justify-center items-center'>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
              </div>
              <div className={`w-full break-all flex-1 flex flex-wrap ${activeCard.priority ? "line-clamp-3 sm:line-clamp-4" : "line-clamp-4 sm:line-clamp-5"} rounded-md text-sm sm:text-base`}>
                {activeCard.description}
              </div>
              {activeCard.priority && (
                <div className="w-full h-6 flex items-center justify-center">
                  <div className={`h-5 sm:h-6 mt-2 w-24 sm:w-32 flex justify-center items-center rounded-md text-xs sm:text-sm ${activeCard.priority === "low" ? "bg-blue-100 text-blue-600" : activeCard.priority === "medium" ? "bg-yellow-100 text-yellow-600" : activeCard.priority === "high" ? "bg-red-100 text-red-600" : "hidden"}`}>
                    {activeCard.priority}
                  </div>
                </div>
              )}
            </div>
          ) : isDraggingColumn && activeColumn ? (
            // Column overlay when dragging a column
            <div
              style={{ backgroundColor: activeColumn.color }}
              className={`rounded-xl px-2 sm:px-3 pb-2.5 ${activeColumn.color === "#000000" ? "text-white" : ""} relative flex flex-col h-full`}
            >
              <div className='flex h-10 w-full mt-3 justify-between items-center'>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{activeColumn.name}</div>
                <div className="relative">
                  <svg className="cursor-pointer h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
              </div>
              {/* Preview of cards */}
              <div className="flex-1 overflow-hidden space-y-2 sm:space-y-3 mt-3 opacity-70">
                {activeColumn.cards.slice(0, 3).map((card, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: card.color }}
                    className={`border-2 ${card.color === "#000000" ? "border-white text-white" : "border-black"} flex flex-col relative h-16 sm:h-24 rounded-md pt-1 px-1 pb-2`}
                  >
                    <div className="w-full line-clamp-1 text-sm sm:text-lg font-semibold">
                      {card.title}
                    </div>
                  </div>
                ))}
                {activeColumn.cards.length > 3 && (
                  <div className="text-center text-sm sm:text-lg font-bold">
                    +{activeColumn.cards.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ColumnsModal
        darkMode={darkMode}
        fetchColumns={fetchColumns}
        pages={pages}
        isColumnsModalOpen={isColumnsModalOpen}
        setIsColumnsModalOpen={setIsColumnsModalOpen}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        selectedPageId={selectedPageId}
        setColumns={setColumns}
      />
      <CartsModal
        darkMode={darkMode}
        selectedColumn={selectedColumn}
        fetchColumns={fetchColumns}
        pages={pages}
        isCartsModalOpen={isCartsModalOpen}
        setIsCartsModalOpen={setIsCartsModalOpen}
        selectedCard={selectedCard}
        selectedPageId={selectedPageId}
        setColumns={setColumns}
      />
    </div>
  )
}

export default KanbanPage

