export const formatDate = (timestamp: number): string => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return '';
    }
    return new Date(timestamp).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  export const formatTimeAgo = (timestamp: string): string => {
    const seconds = Math.floor(Date.now() / 1000 - parseInt(timestamp));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };