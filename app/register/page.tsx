import { redirect } from 'next/navigation'

// Redirect to the student's current stage (server-side stage gate)
// TODO: read student.currentStage from DB and redirect accordingly
export default function RegisterPage() {
  redirect('/register/stage-1')
}
