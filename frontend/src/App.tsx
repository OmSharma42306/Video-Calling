// import { Route,Routes,BrowserRouter,useNavigate } from 'react-router-dom'
// import {Sender} from './components/Sender'
// import {Receiver} from './components/Receiver'

// function NaviagationButtons(){
//   const navigate = useNavigate();
//   return (
//   <>
//     <button onClick={()=>navigate('/sender')}>Sender</button>
//     <button onClick={()=> navigate('/receiver')}>Receiver</button>
//   </>
//   );
// }

// function App() {
    

//   return (
//   <BrowserRouter>
//   <>
//       <Routes>  
//       <Route path='/sender' element={<Sender/>}></Route>
//         <Route path='/receiver' element={<Receiver/>}></Route>
//       </Routes>
    

//  <NaviagationButtons/>
//     </>
//     </BrowserRouter>
    
//   )
// }

// export default App

import React from 'react';
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom';
import { Sender } from './components/Sender';
import { Receiver } from './components/Receiver';

function NavigationButtons() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center space-x-4 mt-8">
      <button 
        onClick={() => navigate('/sender')} 
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
      >
        Sender
      </button>
      <button 
        onClick={() => navigate('/receiver')} 
        className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
      >
        Receiver
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Om Sharma's Communication App
            </h1>
            <BrowserRouter>
              <Routes>
                <Route path='/sender' element={<Sender/>} />
                <Route path='/receiver' element={<Receiver/>} />
              </Routes>
              <NavigationButtons />
            </BrowserRouter>
          </div>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>Created by Om Sharma - Software Developer | Full Stack Developer</p>
      </footer>
    </div>
  );
}

export default App;