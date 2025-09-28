import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <main className="flex justify-center p-8">
      <UserProfile />
    </main>
  );
}
