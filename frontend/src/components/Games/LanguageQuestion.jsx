//External imports for handling basic functionality
import { useState, useEffect } from "react"
import PropTypes from "prop-types"

//For handling UI
import styled from "styled-components"
import Lottie from "lottie-react"
import Right from "../../assets/Right.json"
import Wrong from "../../assets/Wrong.json"

//Internal imports
import { useLanguage } from "../../contexts/LanguageContext"

export const LanguageQuestion = ({ type, language, color, subcategory }) => {
  const {
    englishGame,
    setEnglishGame,
    swedishGame,
    setSwedishGame,
    question,
    answers,
    message,
    setMessage,
    disableButton,
    setDisableButton,
    generateQuestion,
    rightAnswer,
  } = useLanguage()

  const game = language === "swedish" ? swedishGame : englishGame
  const setGame = language === "swedish" ? setSwedishGame : setEnglishGame
  const currentScore = game[Number(type)].score
  const { registerAnswer } = useLanguage()

  //Animations to display right/wrong answer and level-change
  const [rightLottie, setRightLottie] = useState(false)
  const [wrongLottie, setWrongLottie] = useState(false)

  //Start by generating a question
  useEffect(() => {
    generateQuestion(language, Number(type))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //Takes users answer and compare it to right answer to generate right/wrong-message
  const handleChoice = async (answer) => {
    if (answer === rightAnswer) {
      setTimeout(() => setRightLottie(true), 500)
      const newGame = [...game]
      setTimeout(() => (newGame[Number(type)].score = currentScore + 1), 3000)
      setTimeout(() => setGame(newGame), 3000)
      setTimeout(() => setRightLottie(false), 4600)

      // Send answer to backend
      setTimeout(async () => {
        try {
          await registerAnswer({
            subject: language,
            level: newGame[type].level,
            subcategory: subcategory,
            score: currentScore + 1,
          })
        } catch (err) {
          console.error("Error registration answer", err)
        }
      }, 3000)
    } else {
      setTimeout(() => setWrongLottie(true), 500)
      setTimeout(() => setMessage(`Rätt svar var ${rightAnswer}.`), 2500)
      setTimeout(() => setWrongLottie(false), 4600)
    }
    setDisableButton(true)
    setTimeout(() => generateQuestion(language, Number(type)), 4500)
  }

  if (game[Number(type)].level < 4) {
    return (
      <div>
        <QuestionCard $color={color}>{question}</QuestionCard>
        <Answers>
          {answers.map((answer, index) => {
            const capsAnswer = answer.charAt(0).toUpperCase() + answer.slice(1)
            return (
              <AnswerButton
                disabled={disableButton}
                key={index}
                value={answer}
                onClick={(event) => handleChoice(event.target.value)}
                $color={color}
              >
                {capsAnswer}
              </AnswerButton>
            )
          })}
          {rightLottie && (
            <FeedbackLottie>
              <Lottie animationData={Right} loop={false} />
            </FeedbackLottie>
          )}
          {wrongLottie && (
            <FeedbackLottie>
              <Lottie animationData={Wrong} loop={false} />
            </FeedbackLottie>
          )}
        </Answers>
        {message && <Message>{message}</Message>}
      </div>
    )
  } else {
    return <Title>Du har klarat alla nivåer! Grattis!</Title>
  }
}

const Title = styled.h1`
  margin: 0;
  font-size: 40px;

  @media (min-width: 700px) {
    font-size: 45px;
  }
`

const QuestionCard = styled.div`
  width: 300px;
  height: 100px;
  align-content: center;
  font-size: 40px;
  background-color: ${(props) =>
    props.$color === "sunset" ? "var(--sunset)" : "var(--forest)"};
  color: white;
  text-shadow: 1px 1px 2px black;
  padding: 20px;
  margin: 10px auto;
  z-index: 1;
  border-radius: 20px;

  @media (min-width: 700px) {
    width: 600px;
    height: 210px;
    font-size: 50px;
  }
`

const Answers = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
  margin: 10px auto;
  position: relative;

  @media (min-width: 700px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 580px;
  }
`

const AnswerButton = styled.button`
  background-color: ${(props) =>
    props.$color === "sunset" ? "var(--sunset)" : "var(--forest)"};
  color: white;
  text-shadow: 1px 1px 2px black;
  width: 270px;
  height: 50px;
  margin: 10px auto;
  padding: 10px 0;
  z-index: 1;
  border-radius: 15px;
  border: none;
  z-index: 1;
  font-size: 20px;
  padding: 15px;
  cursor: pointer;
  box-shadow: 4px 4px
    ${(props) =>
      props.$color === "sunset"
        ? "var(--sunsetshadow)"
        : "var(--forestshadow)"};

  &:hover {
    background-color: ${(props) =>
      props.$color === "sunset" ? "var(--sunsethover)" : "var(--foresthover)"};
    box-shadow: 6px 6px
      ${(props) =>
        props.$color === "sunset"
          ? "var(--sunsetshadow)"
          : "var(--forestshadow)"};
    transition: 0.2s ease;
  }

  &:disabled {
    cursor: default;
    border: none;

    &:hover {
      background-color: ${(props) =>
        props.$color === "sunset" ? "var(--sunset)" : "var(--forest)"};
    }
  }

  @media (min-width: 700px) {
    width: 270px;
    height: 60px;
    padding: 20px;
  }
`

const Message = styled.div`
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  background-color: white;
  z-index: 2;
  font-size: 25px;
  border-radius: 20px;
`

const FeedbackLottie = styled.div`
  position: absolute;
  top: 20%;
  left: 30%;
  transform: translate(-20%, -20%);
  z-index: 2;

  @media (min-width: 700px) {
    top: -100%;
  }
`

LanguageQuestion.propTypes = {
  type: PropTypes.string,
  language: PropTypes.string,
  color: PropTypes.string,
  subcategory: PropTypes.string,
}
