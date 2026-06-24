"use client";

import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function McqPracticeList({
  questions,
  selected,
  onSelect,
  startNumber = 1,
  locked = false,
}) {
  return (
    <div className="mcq-list">
      {questions.map((q, i) => {
        const done = selected[q._id] !== undefined;
        const selectedAns = selected[q._id];
        const isCorrect = selectedAns === q.correctAnswer;
        const questionNum = startNumber + i;

        let cardState = "";
        if (done) cardState = isCorrect ? " mcq-card--correct" : " mcq-card--wrong";

        return (
          <article key={q._id} className={`mcq-card${cardState}`}>
            <header className="mcq-card__head">
              <div className="mcq-card__head-left">
                <span className="mcq-card__num">Q{questionNum}</span>
              </div>
              <span className={`mcq-badge mcq-badge--${q.difficulty || "medium"}`}>
                {q.difficulty || "medium"}
              </span>
            </header>

            <p className="mcq-card__question">{q.text}</p>

            <div className="mcq-options">
              {q.options.map((opt, idx) => {
                let optionClass = "mcq-option";
                if (done || locked) optionClass += " mcq-option--locked";
                if (done && idx === q.correctAnswer) optionClass += " mcq-option--correct";
                else if (done && idx === selectedAns) optionClass += " mcq-option--wrong";

                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={done || locked ? -1 : 0}
                    className={optionClass}
                    onClick={() => !done && !locked && onSelect(q._id, idx)}
                    onKeyDown={(e) => {
                      if (!done && !locked && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onSelect(q._id, idx);
                      }
                    }}
                    aria-disabled={done || locked}
                  >
                    <span className="mcq-option__letter">{LETTERS[idx] || idx + 1}</span>
                    <span className="mcq-option__text">{opt}</span>
                    {done && idx === q.correctAnswer && (
                      <CheckCircle2
                        size={18}
                        className="mcq-option__icon mcq-option__icon--correct"
                        aria-hidden="true"
                      />
                    )}
                    {done && idx === selectedAns && idx !== q.correctAnswer && (
                      <XCircle
                        size={18}
                        className="mcq-option__icon mcq-option__icon--wrong"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {done && (
              <div
                className={`mcq-feedback ${isCorrect ? "mcq-feedback--correct" : "mcq-feedback--wrong"}`}
              >
                <div className="mcq-feedback__head">
                  {isCorrect ? (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  ) : (
                    <XCircle size={18} aria-hidden="true" />
                  )}
                  <strong>{isCorrect ? "Correct!" : "Not quite — review the explanation"}</strong>
                </div>
                <p>{q.explanation || "No explanation available for this question."}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
