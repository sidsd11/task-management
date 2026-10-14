import { createRoot } from 'react-dom/client'
import axios from 'axios'

import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'

axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<AppContextProvider>
			<App />
		</AppContextProvider>
	</BrowserRouter>
)
