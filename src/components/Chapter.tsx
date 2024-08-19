import "./Chapter.css";
import { useEffect, useRef } from "react";
// todo load 1st chapter automatically
function Chapter({
  chapterBody,
  chapterBodyClasses,
  chId,
  stylesContentArr,
}: {
  chapterBodyClasses: string;
  chapterBody: string;
  chId: string;
  stylesContentArr: string[];
}) {
  const iframe = useRef(null);
  useEffect(() => {
    // console.log(iframe, chapterBody, chapterBodyClasses, stylesContentArr, chId);
    if (iframe) {
      const styles = stylesContentArr.map((style: string) => `<style>${style}</style>`).join("");
      // @ts-expect-error -- handler it later
      iframe.current.srcdoc = `<!DOCTYPE html><html><head>${styles}</head><body class="${chapterBodyClasses}"><div style="max-width: 1000px; margin: 0 auto; padding:10px; text-align: left;">${chapterBody.innerHTML}</div></body></html>`;
      if (chapterBody) {
        // @ts-expect-error -- handler it later
        iframe.current.removeAttribute("style");
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
    };
  });
  return (
    <div className="chapter static">
      <iframe ref={iframe} style={{ height: "0px" }} srcDoc="<!DOCTYPE html>"></iframe>
    </div>
  );
}

export default Chapter;
