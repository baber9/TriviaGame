var BibleTrivia = {
    questionsAnswersBank: globalAnswerBank,
    
    questionCount: 0,

    incorrectCount: 0,

    unansweredCount: 0,
    
    correctCount: 0,

    getRandomQuestion: function() {
        this.clearDivs();
        var randomIndex = Math.floor(Math.random() * this.questionsAnswersBank.length);
        console.log(randomIndex);
        this.displayQuestion(this.questionsAnswersBank[randomIndex]);
    },

    displayQuestion: function(question) {
        // Increment Question Count
        this.questionCount++;
        console.log("QuestionCount", this.questionCount);
        // Display time
        $("#time").html('Time Remaining:&nbsp; <span id="timer">&nbsp;</span> second(s)')

        // start TIMER, if not answered in time, null answer
        this.startTimer(7, function() {
            BibleTrivia.checkAnswer(null, question);
        });

        $("#question").html(question.title);

        question.choices.push(question.answer);

        for (i = 0; question.choices.length > 0; i++) {
            // Clear current answer#
            $("#answer-" +  i).html("");
            var randomIndex = Math.floor(Math.random() * (question.choices.length));
            $("#answer-" + i).append(question.choices[randomIndex]);
            question.choices.splice(randomIndex, 1);
        }
        // Remove question from array, so that it isn't repeated
        this.questionsAnswersBank.splice(this.questionsAnswersBank.indexOf(question), 1);
        $(".answer-block").children("div").on("click", function () {
            var userAnswer;
            userAnswer = $(this).text();
            console.log(userAnswer);
            BibleTrivia.checkAnswer(userAnswer, question);
        }); 
    },

    startTimer: function (time, callback) {
        var intervalID;
    
        // if answer is clicked, stop timer
        $(".answer-block").children("div").on("click", function () {
            clearInterval(intervalID)});
        
        var intervalID = setInterval(decrement, 1000);
        
        function decrement() {
            
            time--;
            $("#timer").html(time);
            
            if (time === 0) {
                clearInterval(intervalID);
                // callback is used to in displayQuestion to answer ""
                callback();
            }
        }
    },

    // Used to clear all divs between question and answer screens
    clearDivs: function () {
        $("#time").empty();
        $("#question").empty();
        $("#next-question").hide();
        for (i = 0; i < 4; i++) {
            $("#answer-" + i).empty();
        }
    },

    checkAnswer: function (userAnswer, bankQuestion) {
        console.log(this.questionsAnswersBank.length)
        var result;
        if (userAnswer === bankQuestion.answer) {
            result = "Right!";
            this.correctCount++;
            console.log("Correct Answers", this.correctCount);
        } else if (userAnswer === null) {
            result = "Out of Time!";
            this.unansweredCount++;
            console.log("Unanswered", this.unansweredCount);
        } else {
            result = "Sorry!";
            this.incorrectCount++;
            console.log("Incorrect Answers", this.incorrectCount);
        }
        
        this.displayAnswer(result, userAnswer, bankQuestion);
    },

    displayAnswer: function (result, userAnswer, bankQuestion) {
        this.clearDivs();
    
        $(".answer-block").children("div").off("click") 
        
    
        $("#question").html(result);
        if (result === "Right!") {
            $("#answer-0").html(`"${userAnswer}" is correct!`);
        } else if (result === "Sorry!") {
            $("#answer-0").html(`"${userAnswer}" is incorrect!`);
            $("#answer-1").html(`The correct answer is "${bankQuestion.answer}".`);
        } else {
            $("#answer-0").html(`"${bankQuestion.answer}" is the correct answer.`);
        }
        this.getBibleVerse(bankQuestion.reference);
        
        if (this.questionCount < 2) {
            // CLICK BUTTON TO GO TO NEXT QUESTION
            $("#next-question").attr("value", "Next Question").show().on("click", function() {
                // MUST USE UNBIND or it calls getRandomQuestion multiple times!
                $("#next-question").unbind().hide();
                BibleTrivia.getRandomQuestion();
            });
        } else {
            $("#next-question").hide();
            var timerImg = $("<img>").attr("src", "./assets/images/calculating.gif");
            $("#answer-2").append(timerImg);
            setTimeout(this.endGame, 5000);
        }
    
    
    },

    // FUNCTION uses biblia api to 'get' referenced bible verse and attaches a "Read More" anchor
    getBibleVerse: function (verse) {
        verse = verse.substring(1, verse.length - 1);
        var queryUrl = "http://api.biblia.com/v1/bible/content/KJV1900.txt.txt?passage=" + verse + "&callback=myCallbackFunction&key=";
        var apik = "051aecee5b057900c8b82933d40bf972"

        $.ajax({
            url: queryUrl + apik, 
            method: 'GET',
            success: (function(response) {
                // attach "Read More link after bible verse output"
                var readMoreLink = "https://biblia.com/books/nasb95/" + verse.replace(/\s/g, ' ');
                var linkDiv = $("<a></a>").text("Read More").attr("href", readMoreLink).attr("target", "new");
                // only show the first 200 characters of response
                response = (`${response.substring(0, 200)}...`);
                $("#answer-3").html(`${verse} : ${response}`).append(linkDiv);
                }),
            //Don't display on error
            error: (function(){
                $("#answer-3").html(`${verse}`);
            })
        })
    },
    
    endGame: function() {
        BibleTrivia.clearDivs();
        $("#time").text("As Jesus once said...");
        $("#question").html("'It is finished'.. Here's how you did!");
        $("#answer-0").html(`Correct Answers: ${BibleTrivia.correctCount}`);
        $("#answer-1").html(`Incorrect Answer(s): ${BibleTrivia.incorrectCount}`)
        $("#answer-2").html(`Unanswered: ${BibleTrivia.unansweredCount}`);
        $("#answer-3").html(`Final Score: ${Math.floor((BibleTrivia.correctCount/BibleTrivia.questionCount)*100)}%`);
        $("#next-question").attr("value", "Start Over?").show().on("click", function() {
            // Reset Counters and Continue
            BibleTrivia.incorrectCount = 0;
            BibleTrivia.unansweredCount = 0;
            BibleTrivia.correctCount = 0; 
            BibleTrivia.questionCount = 0;
            $("#next-question").unbind().hide();
            BibleTrivia.getRandomQuestion();
        });
    },

    startGame: function () {
        $("#time").text("Welcome to Bible Trivia!");
        $("#question").html("To get started, click the 'Start' button below...");
        $("#next-question").attr("value", "Start").show().on("click", function() {
        $("#next-question").unbind().hide();
        BibleTrivia.getRandomQuestion();
        });
    }

};

$(document).ready(BibleTrivia.startGame());

