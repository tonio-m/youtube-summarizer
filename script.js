// Import core dependencies
import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'

// =============== Component: InputBar ===============
const InputBar = ({ inputUrl, setInputUrl, setVideoUrl, setTranscriptText }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const extractVideoId = (url) => {
            let videoId = ''
            if (url.includes('youtube.com')) {
                videoId = url.split('v=')[1]?.split('&')[0] // Handle additional parameters
            } else if (url.includes('youtu.be')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0] // Handle additional parameters
            }
            return videoId
        }

        const videoId = extractVideoId(inputUrl)
        if (videoId) {
            setIsLoading(true)
            try {
                const response = await fetch(`http://localhost:5000/subtitle?url=${encodeURIComponent(inputUrl)}`)
                const data = await response.json()
                setTranscriptText(data.subtitle)
                setVideoUrl(`https://www.youtube.com/embed/${videoId}`)
                setInputUrl('')
            } finally {
                setIsLoading(false)
            }
        }
    }

    return html`
        <div id="input-bar">
            <form class="mt-3" onSubmit=${handleSubmit}>
                <div class="input-group">
                    <input
                        type="text"
                        class="form-control" 
                        placeholder="Enter YouTube URL"
                        value=${inputUrl}
                        onInput=${(e) => setInputUrl(e.target.value)}
                        disabled=${isLoading}
                    />
                    <button 
                        class="btn btn-primary" 
                        type="submit"
                        disabled=${isLoading}
                    >
                        ${isLoading ? html`
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Loading...
                        ` : 'Summarize'}
                    </button>
                </div>
            </form>
        </div>
    `
}

// =============== Component: LoginForm ===============
const LoginForm = ({ onLogin }) => {
    // State management
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // Simple hardcoded authentication - in a real app, this should be done securely
        if (username === 'admin' && password === 'password') {
            onLogin(true)
            setError('')
        } else {
            setError('Invalid username or password')
        }
    }

    return html`
        <div class="container text-center mt-5">
            <h1 class="display-4">Youtube Summarizer</h1>
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card mt-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Login</h5>
                            <form onSubmit=${handleSubmit}>
                                <div class="mb-3">
                                    <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Username"
                                        value=${username}
                                        onInput=${(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div class="mb-3">
                                    <input
                                        type="password"
                                        class="form-control"
                                        placeholder="Password"
                                        value=${password}
                                        onInput=${(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                ${error && html`<div class="alert alert-danger">${error}</div>`}
                                <button type="submit" class="btn btn-primary">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// =============== Main App Component ===============
function App() {
    // State management
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/jNQXAC9IVRw')
    const [inputUrl, setInputUrl] = useState('')
    const [transcriptText, setTranscriptText] = useState(
        "All right, so here we are, in front of the elephants " +
        "the cool thing about these guys is that they have really... " +
        "really really long trunks and that's cool (baaaaaaaaaaahhh!!) " +
        "and that's pretty much all there is to say"
    )

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return html`<${LoginForm} onLogin=${setIsAuthenticated} />`
    }

    // Main app layout
    return html`
        <div class="container text-center mt-5">
            <h1 class="display-4">Youtube Summarizer</h1>
            <p class="lead">Get the key points from any video in seconds, and see if they're worth your time.</p>
        </div>

        <div class="container mt-1">
            <div class="row">
                ${InputBar({
                    inputUrl,
                    setInputUrl,
                    setVideoUrl,
                    setTranscriptText,
                })}
            </div>

            <div class="row">
                <div id="video-container" class="col-md-6 mt-4">
                    <div class="ratio ratio-16x9">
                        <iframe 
                            src=${videoUrl}
                            title="YouTube video"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                        >
                        </iframe>
                    </div>
                </div>

                <div id="transcript" class="col-md-6 mt-4">
                    <p style="white-space: pre-wrap">${transcriptText}</p>
                </div>
            </div>
        </div>
    `
}

// Initialize the app
render(html`<${App} />`, document.body)