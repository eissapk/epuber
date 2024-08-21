import "./Chapter.css";
import { useEffect, useRef } from "react";
// todo load 1st chapter automatically
function Chapter({
  headerHeight,
  chapterBody,
  chapterBodyClasses,
  chId,
  stylesContentArr,
}: {
  headerHeight: number;
  chapterBodyClasses: string;
  chapterBody: string;
  chId: string;
  stylesContentArr: string[];
}) {
  const iframe = useRef(null);
  const onResize = () => {
    // @ts-expect-error -- handle it later
    iframe.current.style.height = window.innerHeight - headerHeight + "px";
  };
  useEffect(() => {
    // console.log(iframe, chapterBody, chapterBodyClasses, stylesContentArr, chId);
    if (iframe) {
      let styles = stylesContentArr.map((style: string) => `<style>${style}</style>`).join("");
      styles += `
      <style>
      :root{
  --sb-track-color: transparent;
  --sb-thumb-color: #e30b5d;
  --sb-size: 5px;
      }
body::-webkit-scrollbar {
  width: var(--sb-size);
}

body::-webkit-scrollbar-track {
  background: var(--sb-track-color);
  border-radius: 3px;
}

body::-webkit-scrollbar-thumb {
  background: var(--sb-thumb-color);
  border-radius: 3px;
}

@supports not selector(::-webkit-scrollbar) {
  body {
    scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
  }
}
      </style>
  `;

      // @ts-expect-error -- handler it later
      iframe.current.srcdoc = `<!DOCTYPE html><html><head>${styles}</head><body class="${chapterBodyClasses}"><div style="max-width: 1000px; margin: 0 auto; padding:10px; text-align: left;">${chapterBody.innerHTML}</div></body></html>`;
      if (chapterBody) {
        // @ts-expect-error -- handler it later
        iframe.current.removeAttribute("style");
        // @ts-expect-error -- handle it later
        iframe.current.style.height = window.innerHeight - headerHeight + "px";
        window.addEventListener("resize", onResize);
      }

      setTimeout(() => {
        // @ts-expect-error -- handler it later
        const innerDoc = iframe.current.contentDocument || iframe.current.contentWindow.document;
        if (chId && innerDoc.getElementById(chId)) {
          const item = innerDoc.getElementById(chId);
          // console.log(item, chId);
          item.scrollIntoView({ behavior: "smooth", block: "start" }); // todo: fix scrolling works only for the first time
        }
      }, 200);
    }
    return () => {
      // @ts-expect-error -- handler it later
      iframe.current.srcdoc = "";
      window.removeEventListener("resize", onResize);
    };
  }, [chapterBody]);

  return (
    <div className="chapter static">
      <iframe ref={iframe} style={{ height: "0px" }} srcDoc="<!DOCTYPE html>"></iframe>
    </div>
  );
}

export default Chapter;
