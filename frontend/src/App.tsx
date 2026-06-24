import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TopicDetail from './pages/TopicDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/topic/:id" element={<TopicDetail />} />
    </Routes>
  )
}

export default App
