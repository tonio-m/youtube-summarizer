// Import core dependencies
import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'

// Create shared context
const createContext = () => {
  const context = {
    videoUrl: useState('https://www.youtube.com/embed/jNQXAC9IVRw'),
    inputUrl: useState(''),
    usesLeft: useState(5),
    transcriptText: useState(
      "All right, so here we are, in front of the elephants " +
      "the cool thing about these guys is that they have really... " +
      "really really long trunks and that's cool (baaaaaaaaaaahhh!!) " +
      "and that's pretty much all there is to say"
    )
  }
  return context
}

// =============== Component: InputBar ===============
const InputBar = ({ context }) => {
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

        const videoId = extractVideoId(context.inputUrl[0])
        if (videoId) {
            setIsLoading(true)
            try {
                const response = await fetch(`http://localhost:5000/subtitle?url=${encodeURIComponent(context.inputUrl[0])}`)
                const data = await response.json()
                context.transcriptText[1](data.subtitle)
                context.videoUrl[1](`https://www.youtube.com/embed/${videoId}`)
                context.inputUrl[1]('')
                context.usesLeft[1](context.usesLeft[0] - 1)
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
                    value=${context.inputUrl[0]}
                    onInput=${(e) => context.inputUrl[1](e.target.value)}
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
        ${context.usesLeft[0] < 5 && html`
            <div class="alert alert-warning mt-2 d-flex justify-content-center align-items-center gap-3" role="alert">
                <span>Only ${context.usesLeft[0]} uses left.</span>
                <a href="#" class="alert-link">Get 100 daily queries for $1 →</a>
            </div>
        `}
    </div>
    `
}

// =============== Main App Component ===============
function App() {
    const context = createContext()

    // Main app layout
    return html`
        <div class="container text-center mt-5">
            <h1 class="display-4">Youtube Summarizer</h1>
            <p class="lead">Get the key points from any video in seconds, and see if they're worth your time.</p>
        </div>

        <div class="container mt-1">
            <div class="row">
                ${InputBar({ context })}
            </div>

            <div class="row">
                <div id="video-container" class="col-md-6 mt-4">
                    <div class="ratio ratio-16x9">
                        <iframe 
                            src=${context.videoUrl[0]}
                            title="YouTube video"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                        >
                        </iframe>
                    </div>
                </div>

                <div id="transcript" class="col-md-6 mt-4">
                    <p style="white-space: pre-wrap">${context.transcriptText[0]}</p>
                </div>
            </div>
        </div>
    `
}

// Initialize the app
render(html`<${App} />`, document.body)