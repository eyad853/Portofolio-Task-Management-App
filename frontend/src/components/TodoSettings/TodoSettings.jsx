import React from 'react'
import { FaTrash } from 'react-icons/fa6'

const TodoSettings = ({deleteTodo,type, darkMode , fetchTodos , onProgressTodo ,setIsUpdateTodoModal, setOpenTodoId , todoId}) => {
  return (
    <div className={` w-40 h-32 border border-gray-400 shadow-xl rounded-md ${darkMode?"bg-gray-900 text-white":"bg-white"} flex flex-col `}>
      <div 
      onClick={()=>{
        setOpenTodoId(null);
        // Only call onProgressTodo if todoId exists
        if (todoId) {
            onProgressTodo(todoId);
            fetchTodos()
        } else {
            console.error("Cannot update task: todoId is undefined" , todoId);
        }
      }}
      className={`w-full cursor-pointer hover:${darkMode?"bg-gray-950":"bg-neutral-200"} transition-all hover:text-blue-600 duration-200 h-1/3 flex justify-center items-center  font-semibold`}>on progress</div>

      <div 
      onClick={()=>{
        setIsUpdateTodoModal(true)
        
      }}
      className={`w-full cursor-pointer hover:${darkMode?"bg-gray-950":"bg-neutral-200"} transition-all hover:text-blue-600 duration-200 h-1/3 flex justify-center items-center  font-semibold`}>update task</div>

      <div 
      onClick={()=>{
        setOpenTodoId(null)
        deleteTodo(todoId)
      }}
      className={`w-full cursor-pointer hover:${darkMode?"bg-gray-950":"bg-neutral-200"} h-1/3 flex justify-center items-center gap-3 hover:text-red-600 transition-all duration-200  font-semibold`}>
        delete task <FaTrash />
      </div>

    </div>
  )
}

export default TodoSettings