import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import { AppNetworkBackground } from './ui/AppNetworkBackground'
import './styles/global.css'

function App() {
  return (
    <AppProviders>
      <div className="app-shell">
        <AppNetworkBackground />

        <div className="app-shell-content">
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </div>
      </div>
    </AppProviders>
  )
}

export default App
