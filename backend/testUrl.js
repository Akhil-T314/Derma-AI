
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.replace(/\\/g, "/");
  return cleanUrl.startsWith("/") ? `http://localhost:3000${cleanUrl}` : `http://localhost:3000/${cleanUrl}`;
};
console.log(getImageUrl("uploads\\3f07642377a3a79eba1fa3e2dac3fca6"));

