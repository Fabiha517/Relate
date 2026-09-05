import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import ClickSpark from './components/ClickSpark'
import GlowCursor from './components/GlowCursor'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlowCursor
      color="#dfba41"
      secondaryColor="#eaa208"
       trailLength={20}
  trailWidth={9}
  glowIntensity={2.4}
  glowSpread={1.5}
  hotspot={0.9}
  brightness={2}
  opacity={1}
  blendMode="normal"
    >
      <ClickSpark
        sparkColor="#FFD84D"
        sparkSize={9}
        sparkRadius={22}
        sparkCount={10}
        duration={800}
        extraScale={1}
      >
        <App />
      </ClickSpark>
    </GlowCursor>
  </StrictMode>
)