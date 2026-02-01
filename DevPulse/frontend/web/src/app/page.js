import { ClerkProvider } from "@clerk/nextjs";
export default function Home() {
  return (
    <ClerkProvider>
      <div>
        <h1>Welcome to DevPulse</h1>
      </div>
    </ClerkProvider>
  );
}
