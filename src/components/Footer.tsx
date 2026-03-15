export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} Community Match AI. All rights reserved.</p>
        <p className="mt-2">Built for the Hackathon MVP.</p>
      </div>
    </footer>
  );
}
