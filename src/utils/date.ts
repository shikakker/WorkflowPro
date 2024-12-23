declare global {
  interface Date {
    toRelativeString(): string;
  }
}

Date.prototype.toRelativeString = function() {
  const now = new Date();
  const diff = now.getTime() - this.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export {};