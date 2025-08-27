import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FaEllipsis } from 'react-icons/fa6'
import { RxDragHandleDots2 } from 'react-icons/rx'
import ViewCard from '../Modals/ViewCard/ViewCard'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function SortableCard({setColumns,selectedColumn,setSelectedColumn, column, fetchColumns, card, kanbanPage, darkMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false)
  const cardSettingsRef = useRef(null)
  const ellipsisRef = useRef(null)
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardSettingsRef.current && 
          !cardSettingsRef.current.contains(e.target) &&
          ellipsisRef.current && 
          !ellipsisRef.current.contains(e.target)) {
        setIsCardSettingsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEllipsisClick = (e) => {
    e.stopPropagation();
  
    if (ellipsisRef.current) {
      const rect = ellipsisRef.current.getBoundingClientRect();
      setSettingsPosition({
        top: rect.bottom,
        left: rect.left -40 // Offset to center menu under the ellipsis
      });
    }
    
    setIsCardSettingsOpen(prev => !prev);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 0 : 1,
  }

  const handleDeleteCard = async()=>{
    try{
      setColumns(prev =>prev.map(col => col._id === column._id?{ ...col, cards: col.cards.filter(c => c._id !== card._id) } : col));
      const response = await axios.delete(`http://localhost:8000/deleteKanbanCard/${kanbanPage._id}/${column._id}/${card._id}`)
    }catch(error){
      console.log(error);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: card.color,
      }}
      className={`border-2 ${card.color === "#000000" ? "border-white text-white" : "border-black"} cursor-pointer flex flex-col relative h-43 shadow-2xl rounded-md pt-1 px-1 pb-2`}
      onClick={() => {
        setIsOpen(true)
      }}
    >
      <div className="w-full flex items-center justify-between h-8">
        {/* Title */}
        <div className="font-semibold h-full flex-1 overflow-x-auto hide-scrollbar text-xl">
          {card.title}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing w-5 h-5 flex items-center justify-center"
        >
          <RxDragHandleDots2 />
        </div>

        {/* Settings (ellipsis) */}
        <div
          ref={ellipsisRef}
          className="w-5 relative h-5 flex justify-center items-center"
          onClick={handleEllipsisClick}
        >
          <FaEllipsis className='cursor-pointer' />
        </div>
      </div>

      <div className={`w-full break-all flex-1 flex flex-wrap ${card.priority ? "line-clamp-4" : "line-clamp-5"} rounded-md`}>
        {card.description}
      </div>

      {card.priority && (
        <div className="w-full h-6 flex items-center justify-center">
          <div className={`h-6 mt-2 w-32 flex justify-center items-center rounded-md ${
            card.priority === "low" ? "bg-blue-100 text-blue-600"
            : card.priority === "medium" ? "bg-yellow-100 text-yellow-600"
            : card.priority === "high" ? "bg-red-100 text-red-600"
            : "hidden"
          }`}>
            {card.priority}
          </div>
        </div>
      )}

      <ViewCard 
        fetchColumns={fetchColumns} 
        kanbanPage={kanbanPage} 
        card={card} 
        darkMode={darkMode} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        setColumns={setColumns}
        column={column}
      />
      
      {isCardSettingsOpen && (
        <div
          onClick={(e)=>{
            e.stopPropagation()
            handleDeleteCard()
          }}
          ref={cardSettingsRef}
          style={{
            position: 'fixed',
            top: `${settingsPosition.top}px`,
            left: `${settingsPosition.left}px`,
          }}
          className={`z-50 ${darkMode?"bg-gray-900 text-whtie":"bg-white text-black"} hover:text-red-600  hover:${darkMode?"bg-gray-950":"bg-gray-200"} transition-all duration-200 flex justify-center items-center shadow-lg border ${darkMode?"border-white":"border-black"} rounded-md p-2  w-24`}
        >
          Delete
        </div>
      )}
    </div>
  )
}