import "./Chapter.css";
import { useEffect } from "react";

function Chapter({ chapterBody, chId, stylesContentArr }: { chapterBody: string; chId: string; stylesContentArr: string[] }) {
  useEffect(() => {
    if (chId && document.getElementById(chId)) {
      document.getElementById(chId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  return (
    <div className="chapter">
      {stylesContentArr.map((style: string, i: number) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: style }}></style>
      ))}
      {/* @ts-expect-error -- handler it later */}
      <div dangerouslySetInnerHTML={{ __html: chapterBody.innerHTML }}></div>
    </div>
  );
}

export default Chapter;
