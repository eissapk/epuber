const input = document.querySelector("input");
const parser = new DOMParser();
var new_zip = new JSZip();

input.onchange = function (e) {
  const file = e.target.files[0];
  const fileType = file.type;
  if (fileType !== "application/epub+zip")
    return alert("imported file is not epub!");

  new_zip
    .loadAsync(file)
    .then((res) => {
      console.warn("res", res);

      const keys = Object.keys(res.files);
      const containerPath = keys.find((item) => item.includes("container.xml"));
      if (!containerPath) return console.error("container.xml doesn't exist!");
      console.warn("container.xml file:", containerPath);

      res.files[containerPath].async("string").then((content) => {
        const dom = parser.parseFromString(content, "text/xml");
        if (!dom) return;
        const rootfile = dom.getElementsByTagName("rootfile")[0];
        if (!rootfile) return;
        const opfPath = rootfile.getAttribute("full-path");
        if (!opfPath) return;
        console.warn("opf file:", opfPath);

        res.files[opfPath].async("string").then((content2) => {
          const dom2 = parser.parseFromString(content2, "text/xml");
          if (!dom2) return;
          const ncx = dom2.getElementById("ncx");
          if (!ncx) return;
          let ncxPath = ncx.getAttribute("href");
          if (!ncxPath) return;
          const arr = opfPath.split("/");
          arr.pop(); // remove file name and keep the reset of path
          ncxPath = arr.join("/") + "/" + ncxPath;
          ncxPath = ncxPath.replace(/\/\//g, "/");
          console.warn("ncx file:", ncxPath);

          const toc = dom2.querySelector('item[properties="nav"]');
          if (!toc) return;
          let tocPath = toc.getAttribute("href");
          if (!tocPath) return;
          const arr2 = tocPath.split("/");
          arr2.pop(); // remove file name and keep the reset of path
          tocPath = arr.join("/") + "/" + tocPath;
          tocPath = tocPath.replace(/\/\//g, "/");
          console.warn("toc file:", tocPath);

          res.files[tocPath].async("string").then((toc_) => {
            const tocDom = parser.parseFromString(toc_, "text/xml");
            if (!tocDom) return;
            const nav = tocDom.querySelector("nav#toc");
            if (!nav) return;
            console.warn(nav);
            const main = document.querySelector("main");
            main.innerHTML = nav.outerHTML;
          });
        });
      });
    })
    .catch(console.error);
};
