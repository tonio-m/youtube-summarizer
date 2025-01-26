import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'

function App() {
    const [count, setCount] = useState(0)
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/jNQXAC9IVRw')
    const [inputUrl, setInputUrl] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        
        // Extract video ID from either youtube.com or youtu.be URLs
        let videoId = ''
        if (inputUrl.includes('youtube.com')) {
            videoId = inputUrl.split('v=')[1]?.split('&')[0] // Handle additional parameters
        } else if (inputUrl.includes('youtu.be')) {
            videoId = inputUrl.split('youtu.be/')[1]?.split('?')[0] // Handle additional parameters
        }

        if (videoId) {
            setVideoUrl(`https://www.youtube.com/embed/${videoId}`)
            setInputUrl('')
        }
    }

    return html`
    <div class="container mt-5">
        <div class="row">
            <div id="input-bar">
                <form class="mt-3" onSubmit=${handleSubmit}>
                    <div class="input-group">
                        <input 
                            type="text" 
                            class="form-control" 
                            placeholder="Enter YouTube URL"
                            value=${inputUrl}
                            onInput=${(e) => setInputUrl(e.target.value)}
                        />
                        <button class="btn btn-primary" type="submit">
                            Update Video
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="row">
            <div id="video-container" class="col-md-6 mt-4">
                <div class="ratio ratio-16x9">
                    <iframe 
                        src=${videoUrl}
                        title="YouTube video"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>

            <div id="ui" class="col-md-6">
                <h1 class="display-4">React + HTM Example</h1>
                <p class="lead">Count: ${count}</p>
                <button class="btn btn-primary" onClick=${() => setCount(count + 1)}>
                    Increment
                </button>
            </div>
        </div>
    </div>
    `
}

render(html`<${App} />`, document.body)