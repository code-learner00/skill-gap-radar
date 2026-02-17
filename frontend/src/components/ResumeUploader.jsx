import { useState, useRef } from 'react'
import useAxios from '../hooks/useAxios'

export default function ResumeUploader({ onResumeId }) {
  const axios    = useAxios()
  const fileRef  = useRef()

  const [mode,    setMode]    = useState('upload')  // 'upload' | 'paste'
  const [text,    setText]    = useState('')
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(false)
  const [isOk,    setIsOk]    = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setStatus('Uploading PDF...')
    setIsOk(false)

    const fd = new FormData()
    fd.append('resume', file)

    try {
      const res = await axios.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onResumeId(res.data.resume._id)
      setIsOk(true)
      setStatus(
        `✓ Resume uploaded. ${res.data.resume.extractedSkills.length} skills detected.`
      )
    } catch (err) {
      setIsOk(false)
      setStatus('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    if (text.trim().length < 50) {
      setStatus('Please paste more text (minimum 50 characters).')
      setIsOk(false)
      return
    }

    setLoading(true)
    setStatus('Processing resume text...')
    setIsOk(false)

    try {
      const res = await axios.post('/resume/paste', { text })
      onResumeId(res.data.resume._id)
      setIsOk(true)
      setStatus(
        `✓ Resume saved. ${res.data.resume.extractedSkills.length} skills detected.`
      )
    } catch (err) {
      setIsOk(false)
      setStatus('Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resume-uploader">
      <div className="tab-row">
        <button
          className={mode === 'upload' ? 'tab active' : 'tab'}
          onClick={() => setMode('upload')}
          type="button"
        >
          📄 Upload PDF
        </button>
        <button
          className={mode === 'paste' ? 'tab active' : 'tab'}
          onClick={() => setMode('paste')}
          type="button"
        >
          ✏️ Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <div
            className="upload-area"
            onClick={() => !loading && fileRef.current.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileUpload}
              disabled={loading}
            />
            <div className="upload-icon">📄</div>
            <p>{loading ? 'Uploading...' : 'Click to upload your resume PDF (max 5 MB)'}</p>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            rows={10}
            placeholder="Paste your resume text here (include sections like Experience, Projects, Skills for best results)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <button onClick={handlePaste} disabled={loading} type="button">
            {loading ? 'Processing...' : 'Save Resume'}
          </button>
        </div>
      )}

      {status && (
        <p className={isOk ? 'success-msg' : 'error-msg'}>
          {status}
        </p>
      )}
    </div>
  )
}