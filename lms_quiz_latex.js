// lms 퀴즈가 LaTeX로 작성된 경우 LaTeX raw text를 모두 파싱
// LLM prompt: 이 배열은 퀴즈 문제와 보기 5개, 총 n문제로 (1+5)*n개의 LaTeX raw임. 문제 k번에 필요한 사진은 k.png로 제공됨. array.len == 6*n인지 확인하고, 모든 문제를 풀것

// 1. id가 MathJax-Element로 시작하는 모든 script 태그 또는 특정 class/tag 추출
const mathjaxElements = document.querySelectorAll('script[type^="math/tex"]');

// 2. 각 요소의 textContent를 배열로 수집
const mathTexts = Array.from(mathjaxElements).map(el => el.textContent.trim());

// 콘솔에 결과 출력
console.log(mathTexts);


// 정답 배열 auto select
(() => {
  const answers = [5, 3, 5, 1, 4, 5, 2, 3, 5, 2, 5, 5, 3, 5, 5, 4, 3, 1, 2, 4, 1, 2, 5, 2];

  // 페이지에 나타나는 순서대로 문제별 라디오 버튼 수집
  const groups = [...document.querySelectorAll(".answers")]
    .map(el => [
      ...el.querySelectorAll('input.question_input[type="radio"]')
    ])
    .filter(inputs => inputs.length > 0);

  if (groups.length !== answers.length) {
    throw new Error(
      `문제 수 불일치: 페이지 ${groups.length}개 / 배열 ${answers.length}개. ` +
      `모든 문제가 로드되었는지 확인하세요.`
    );
  }

  // 클릭 전에 전체 배열 검증
  const targets = Array.from(answers, (choice, i) => {
    const inputs = groups[i];

    if (inputs.length !== 5) {
      throw new Error(`${i + 1}번째 문제: 보기가 ${inputs.length}개입니다.`);
    }

    if (!Number.isInteger(choice) || choice < 1 || choice > 5) {
      throw new Error(`${i + 1}번째 문제: 보기 번호는 1~5여야 합니다.`);
    }

    const input = inputs[choice - 1];

    if (input.matches(":disabled")) {
      throw new Error(`${i + 1}번째 문제: 선택할 수 없는 상태입니다.`);
    }

    return input;
  });

  // 실제 클릭으로 선택 및 change 이벤트 발생
  targets.forEach((input, i) => {
    if (!input.checked) input.click();

    if (!input.checked) {
      throw new Error(`${i + 1}번째 문제: 선택에 실패했습니다.`);
    }
  });

  console.table(targets.map((input, i) => ({
    "문제 순서": i + 1,
    "선택한 보기": answers[i],
    "보기 내용": input.getAttribute("aria-label"),
    "선택 확인": input.checked
  })));

  console.log(`${targets.length}개 문제의 보기 선택 완료`);
})();