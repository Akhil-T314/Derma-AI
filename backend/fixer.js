const fs = require("fs");
let s = fs.readFileSync("C:/Users/Alan roy/Desktop/thankachan-new/src/pages/shared/CaseDetail.jsx", "utf8");
s = s.replace(/src=\{scan\.original_image_url \|\| scan\.image_url \? \`http:\/\/localhost:3000\$\{.*?\} \` \: \"https:\/\/images\..*?\"\}/g, `src={getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400"}`);
s = s.replace(/src=\{scan\.xai_heatmap_url.*?\}\)/g, `src={getImageUrl(scan.xai_heatmap_url) || getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"}`);
fs.writeFileSync("C:/Users/Alan roy/Desktop/thankachan-new/src/pages/shared/CaseDetail.jsx", s);
console.log("Done");
