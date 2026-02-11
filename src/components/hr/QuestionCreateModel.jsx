import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { showWarningAlert } from "../../utils/swal";

const QuestionCreateModal = ({
  show,
  onHide,
  onSave,
  mode = "CREATE",
  editData = null,
}) => {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("Single");
  const [isActive, setIsActive] = useState(true);
  const [answers, setAnswers] = useState([]);

  const resetForm = () => {
    setQuestion("");
    setQuestionType("Single");
    setIsActive(true);
    setAnswers([
      { id: Date.now(), answer: "", is_correct: false },
    ]);
  };

  useEffect(() => {
    if (mode === "EDIT" && editData) {
      setQuestion(editData.question);
      setQuestionType(editData.question_type);
      setIsActive(editData.is_active);
      setAnswers(editData.answers ?? []);
    } else {
      resetForm();
    }
  }, [mode, editData]);

  const addOption = () => {
    const hasEmptyOption = answers.some((a) => !a.answer || a.answer.trim() === "");

    if (hasEmptyOption) {
      showWarningAlert("Please fill in all existing options before adding a new one.");
      return;
    }

    setAnswers([
      ...answers,
      { id: Date.now() + Math.random(), answer: "", is_correct: false },
    ]);
  };

  const updateOption = (id, value) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, answer: value } : a
      )
    );
  };

  const toggleCorrect = (id) => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (questionType === "Single") {
          return { ...a, is_correct: a.id === id };
        }
        return a.id === id
          ? { ...a, is_correct: !a.is_correct }
          : a;
      })
    );
  };

  const deleteOption = (id) => {
    setAnswers((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCancel = () => {
    resetForm();
    onHide();
  };

  const handleSave = () => {

    if (!question.trim()) {
      showWarningAlert("Question text is required.");
      return;
    }

    if (answers.length < 2) {
      showWarningAlert("At least two options are required.");
      return;
    }

    const hasEmptyOption = answers.some((a) => !a.answer || a.answer.trim() === "");
    if (hasEmptyOption) {
      showWarningAlert("All options must have text.");
      return;
    }

    const hasCorrectAnswer = answers.some((a) => a.is_correct);
    if (!hasCorrectAnswer) {
      showWarningAlert("Please mark at least one correct answer.");
      return;
    }

    const payload = {
      question: question,
      question_type: questionType,
      answers: answers,
      is_active: isActive,
    };

    onSave(payload);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "CREATE" ? "Create Question" : "Edit Question"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <label className="form-label fw-bold">Question Text</label>
          <textarea
            className="form-control"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="d-flex align-items-end gap-3 mb-3">
          <div style={{ minWidth: "200px" }}>
            <label className="form-label fw-bold">Question Type</label>
            <select
              className="form-select"
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value);
                setAnswers(prev => prev.map(a => ({ ...a, is_correct: false })));
              }}
            >
              <option value="Single">Single Choice</option>
              <option value="Multiple">Multiple Choice</option>
            </select>
          </div>

          <button
            className="btn btn-success"
            onClick={addOption}
            style={{ height: "38px" }}
          >
            Add Option
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Option</th>
                <th style={{ width: "150px" }}>Status</th>
                <th style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((a) => (
                <tr key={a.id}>
                  <td>
                    <input
                      className="form-control"
                      value={a.answer}
                      onChange={(e) =>
                        updateOption(a.id, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                  </td>
                  <td>
                    <select
                      className={`form-select ${a.is_correct ? "border-success text-success fw-bold" : ""}`}
                      value={a.is_correct ? "correct" : "incorrect"}
                      onChange={() => toggleCorrect(a.id)}
                    >
                      <option value="incorrect">Incorrect</option>
                      <option value="correct">Correct</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteOption(a.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save Question
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuestionCreateModal;