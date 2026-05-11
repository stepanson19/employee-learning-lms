import type { QuizQuestion, QuizResult } from "@/types/lms";

export const passingQuizScore = 70;

export function gradeQuizAttempt(questions: QuizQuestion[], answers: Record<string, string>): QuizResult {
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((question) => answers[question.id] === question.correctOptionId).length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    correctAnswers,
    totalQuestions,
    score,
    passed: totalQuestions > 0 && score >= passingQuizScore
  };
}
