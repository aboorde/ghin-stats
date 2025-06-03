import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import RoundByRoundView from './components/RoundByRoundView'
import HoleByHoleView from './components/HoleByHoleView'
import CourseByCourseSummary from './components/CourseByCourseSummary'
import YearByYearAnalysis from './components/YearByYearAnalysis'
import PineValleyAnalysis from './components/PineValleyAnalysis'

function App() {
  // Handle both /ghin-stats and /ghin-stats/ paths
  const basename = window.location.pathname.includes('/ghin-stats') ? '/ghin-stats' : '';
  
  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<RoundByRoundView />} />
          <Route path="/round-by-round" element={<RoundByRoundView />} />
          <Route path="/hole-by-hole" element={<HoleByHoleView />} />
          <Route path="/course-summary" element={<CourseByCourseSummary />} />
          <Route path="/year-by-year" element={<YearByYearAnalysis />} />
          <Route path="/pine-valley" element={<PineValleyAnalysis />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App