

document.addEventListener("DOMContentLoaded", function () {
  const quizForm = document.querySelector("#quizPopup form");
  const quizScore = document.getElementById("quizScore");

  const quizResult = document.getElementById("quizResult");
  const finishQuizBtn = document.getElementById("finishQuizBtn");
  const submitBtn = quizForm.querySelector(".btn-submit");
  const btn = document.getElementById('completeBtn');
  const quizzPopup = document.getElementById('quizPopup');
  const allLabels = quizForm.querySelectorAll('label');
  // === Nút mở popup quizz ===
  if (btn && quizzPopup) {
    btn.addEventListener('click', () => {
      const alarm = quizForm.querySelector('.alarm-quizz');
      if (alarm) {
        alarm.remove();
      }

      quizResult.style.display = "none";
      quizzPopup.style.display = 'flex';
      submitBtn.style.display = "block";
      allLabels.forEach(label => {
        label.classList.remove('correct-answer', 'incorrect-user-answer');
      });
    });
  }

  // Bình luận
  // === Gửi bình luận ===
  const sendBtn = document.getElementById("sendComment");
  const commentInput = document.getElementById("commentInput");
  const commentList = document.getElementById("commentList");
  const commentCountEl = document.querySelector(".comment-section h4 span");

  // Hàm cập nhật số lượng bình luận
  function updateCommentCount() {
    const commentCount = commentList.querySelectorAll("p").length;
    if (commentCountEl) {
      commentCountEl.textContent = `${commentCount} bình luận`;
    }
  }

  // Gọi 1 lần khi trang vừa load
  updateCommentCount();

  if (sendBtn && commentInput && commentList) {
    sendBtn.addEventListener("click", () => {
      const content = commentInput.value.trim();
      if (content !== "") {
        const p = document.createElement("p");
        p.innerHTML = `<strong>Bạn</strong><br>${content}`;
        commentList.appendChild(p);
        commentInput.value = "";

        // Cập nhật số bình luận sau khi thêm
        updateCommentCount();
      }
    });
  }



  // === Xử lý quizz ===
  /**
      * Object lưu trữ đáp án đúng của tất cả câu hỏi*/
  const correctAnswers = {
    0: 'OpenAI',
    1: ['1', '3'],
    2: 'Generative Pre-trained Transformer'

  };

  /**
   * Hàm dành cho dạng câu nhiều đáp án
   * @param {string} arr1  đáp án người dùng 
   * @param {string} arr2  đáp án đúng 
   */
  function multiplechoice(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    // Sắp xếp để so sánh không phụ thuộc thứ tự
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) return false;
    }
    return true;
  }
  /**
  * Xử lý khi nhấn nút submit
  */
  if (quizForm) {
    quizForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let score = 0;
      const questionBoxes = quizForm.querySelectorAll('.question-box');
      const totalQuestions = questionBoxes.length;


      allLabels.forEach(label => {
        label.classList.remove('correct-answer', 'incorrect-user-answer');
      });
      submitBtn.style.display = "none";

      console.log(questionBoxes);
      questionBoxes.forEach((box, index) => {
        const firstInput = box.querySelector('input');
        const allInput = box.querySelectorAll(`input`);
        if (!firstInput) {
          console.warn(`Khối câu hỏi thứ ${index + 1} không có input với thuộc tính 'name'. Bỏ qua.`);
          return;
        }
        const questionType = firstInput.getAttribute('type');
        const correctAnswer = correctAnswers[index];

        let isCorrect = false;

        console.log(`Đang kiểm tra câu: ${index + 1} (Loại: ${questionType})`);

        if (correctAnswer === undefined) {
          console.warn(`Không tìm thấy đáp án cho câu hỏi "${index + 1}" trong correctAnswers.`);
          return;
        }

        switch (questionType) {
          case 'radio':
            const selectedRadio = box.querySelector(`input:checked`);
            allInput.forEach(input => {
              const label = input.closest('label');
              if (selectedRadio && input === selectedRadio && selectedRadio.value !== correctAnswer) {
                label.classList.add('incorrect-user-answer');
              }
              if (selectedRadio && input === selectedRadio && selectedRadio.value === correctAnswer) {
                isCorrect = true;
                label.classList.add('correct-answer');
              }
            });
            console.log(`  -> Radio: Chọn '${selectedRadio ? selectedRadio.value : 'Không chọn'}', Đúng là '${correctAnswer}', Kết quả: ${isCorrect}`);
            break;
          case 'checkbox':
            const selectedCheckboxes = box.querySelectorAll(`input:checked`);
            let isCount = 0;
            // Xử lý check đáp án
            selectedCheckboxes.forEach(input => {
              let isCheck = 0;
              const label = input.closest('label');
              //isCheck để kiểm tra đáp án đúng hay sai, isCount để kiểm tra số lượng đáp án đúng
              for (let i = 0; i < correctAnswer.length; i++) {
                console.log(input.value, correctAnswer[i]);
                if (correctAnswer[i] == input.value) {
                  isCheck++;
                  isCount++;
                  console.log('Đúng');
                } else {
                  console.log('Sai');
                }
              }
              if (isCheck === 1) {
                label.classList.add('correct-answer');
              } else {
                label.classList.add('incorrect-user-answer');
              }
            });
            //Nếu isCount đủ thì số input được chọn cũng phải đủ (tránh trường hợp user chọn tất cả đáp án)
            if (isCount === correctAnswer.length && selectedCheckboxes.length === correctAnswer.length) {
              isCorrect = true;
            } else {
              const p = document.createElement('p');
              p.classList = "alarm-quizz"
              p.textContent = 'Thừa hoặc thiếu đáp án đúng';
              p.style.color = 'red';
              box.appendChild(p);
            }
            console.log(` Kết quả: ${isCorrect}`);
            break;

          case 'text':
            const textInput = box.querySelector(`input`);
            console.log(textInput);
            // So sánh không phân biệt hoa thường và loại bỏ khoảng trắng thừa
            if (textInput && typeof correctAnswer === 'string' && textInput.value.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
              textInput.style.backgroundColor = "#d1fae5";
              isCorrect = true;
            } else if (typeof correctAnswer !== 'string') {
              console.warn(`Đáp án cho câu text "${questionName}" trong correctAnswers phải là một CHUỖI.`);
            }
            console.log(`  -> Text: Nhập '${textInput ? textInput.value : ''}', Đúng là '${correctAnswer}', Kết quả: ${isCorrect}`);
            break;

          default:
            console.warn(`Loại input "${questionType}" của câu hỏi "${questionName}" không được hỗ trợ kiểm tra.`);
        }

        // Tăng điểm nếu trả lời đúng
        if (isCorrect) {
          score++;
        }
      });
      if (quizScore && quizResult) {
        if (score < Math.floor(totalQuestions / 2)) {
          quizScore.textContent = `Kết quả: ${score} / ${totalQuestions} câu đúng. Không đạt`;
          finishQuizBtn.textContent = 'Làm lại';
        }
        else {
          quizScore.textContent = `Kết quả: ${score} / ${totalQuestions} câu đúng.`;
          finishQuizBtn.textContent = 'Hoàn thành';
        }
        quizResult.style.display = "block";
      }
    });
  }

  // Nút hoàn thành để ẩn popup
  if (finishQuizBtn) {
    finishQuizBtn.addEventListener("click", () => {
      quizzPopup.style.display = "none";
    });
  }

});
