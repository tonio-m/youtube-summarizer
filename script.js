import { html, render, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'



const InputBar = ({ inputUrl, setInputUrl, setVideoUrl, setTranscriptText }) => {
    const handleSubmit = async (e) => {
        e.preventDefault()
        // Extract video ID from either youtube.com or youtu.be URLs
        let videoId = ''
        if (inputUrl.includes('youtube.com')) {
            videoId = inputUrl.split('v=')[1]?.split('&')[0] // Handle additional parameters
        } else if (inputUrl.includes('youtu.be')) {
            videoId = inputUrl.split('youtu.be/')[1]?.split('?')[0] // Handle additional parameters
        }

        if (videoId) {
            const response = await fetch(`http://localhost:5000/subtitle?url=${encodeURIComponent(inputUrl)}`);
            const data = await response.json();
            setTranscriptText(data.subtitle);
            setVideoUrl(`https://www.youtube.com/embed/${videoId}`)
            setInputUrl('')
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
          />
          <button class="btn btn-primary" type="submit">
            Summarize
          </button>
        </div>
      </form>
    </div>
  `
}

const youtubeVideo = ({videoUrl}) => {
  return html`<div class="ratio ratio-16x9">
      <iframe 
          src=${videoUrl}
          title="YouTube video"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
      </iframe>
  </div>`
}

function App() {
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/jNQXAC9IVRw')
    const [inputUrl, setInputUrl] = useState('')
    const [transcriptText, setTranscriptText] = useState("All right, so here we are, in front of the elephants the cool thing about these guys is that they have really... really really long trunks and that's cool (baaaaaaaaaaahhh!!) and that's pretty much all there is to say")

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
            ${youtubeVideo({videoUrl})}
            </div>

            <div id="transcript" class="col-md-6 mt-4">
            <p style="white-space: pre-wrap">${transcriptText}</p>
            </div>
        </div>
    </div>
    `
}

render(html`<${App} />`, document.body)