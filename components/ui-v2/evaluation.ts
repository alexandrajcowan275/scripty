export type BlindQuestion = {
  shotId: string;
  attributeKey: string;
  expected: string;
  imageUrl: string;
  referenceImageUrl: string;
};
export type HumanLabel = {
  shotId: string;
  attributeKey: string;
  pass: boolean | null;
  note?: string;
  createdAt: string;
};
export type LabelData = { questions: BlindQuestion[]; labels: HumanLabel[] };
export type Evaluation = {
  precision: number | null;
  recall: number | null;
  accuracy: number | null;
  humanLabels: number;
  uncertainHumanLabels: number;
  evaluatedLabels: number;
  metricsReady: boolean;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  caveat?: string;
};
export const questionKey = (value: { shotId: string; attributeKey: string }) =>
  `${value.shotId}\u0000${value.attributeKey}`;
export function pendingQuestions(data: LabelData) {
  const answered = new Set(data.labels.map(questionKey));
  return data.questions.filter(
    (question) => !answered.has(questionKey(question)),
  );
}
export const metricsVisible = (evaluation?: Evaluation | null) =>
  !!evaluation?.metricsReady && evaluation.evaluatedLabels >= 20;

export type MatrixCell = keyof Evaluation["confusionMatrix"];
/** A saved human judgment can highlight only a cell whose real count increased. */
export function changedMatrixCell(
  previous: Evaluation | null,
  next: Evaluation,
): MatrixCell | null {
  if (!previous) return null;
  const cells: MatrixCell[] = [
    "truePositives",
    "falsePositives",
    "falseNegatives",
    "trueNegatives",
  ];
  return (
    cells.find(
      (cell) => next.confusionMatrix[cell] > previous.confusionMatrix[cell],
    ) ?? null
  );
}
