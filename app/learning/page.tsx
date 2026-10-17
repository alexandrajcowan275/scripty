import { redirect } from "next/navigation";
export default function LearningPage() {
  redirect("/studio?view=progress");
}
