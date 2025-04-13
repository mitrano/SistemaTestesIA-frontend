import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import {
  Container,
  Button,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  IconButton,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  LinearProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_URL = "http://localhost:8000";

function App() {
// Prompt base que será usado para gerar o teste com IA
  const [prompt, setPrompt] = useState("");
// Número de questões que serão geradas
  const [questionsCount, setQuestionsCount] = useState(5);
// Tipo de questão: múltipla escolha, discursiva ou mista
  const [questionType, setQuestionType] = useState("multiple_choice");
// Nível de dificuldade das questões
  const [difficulty, setDifficulty] = useState("medium");
// Lista de testes carregados da API
  const [tests, setTests] = useState([]);
// Indica se a criação do teste está em andamento
  const [loading, setLoading] = useState(false);
// Estado para exibir mensagens de feedback (sucesso/erro)
  const [feedback, setFeedback] = useState({ open: false, message: "" });
// Provedor fixo da IA (atualmente OpenAI)
  const [provider] = useState("openai");
// ID do teste que está com perguntas sendo editadas
  const [editingQuestionsId, setEditingQuestionsId] = useState(null);
// Texto JSON com perguntas sendo editadas
  const [editedQuestions, setEditedQuestions] = useState("");
// Armazena as respostas fornecidas pelo usuário
  const [userAnswers, setUserAnswers] = useState({});
// Armazena os resultados de validação das respostas
  const [showValidation, setShowValidation] = useState({});
// Indica se um teste está sendo processado no momento
  const [processing, setProcessing] = useState({});

// Estado para controlar abertura do modal com prompt completo
  const [openPromptModal, setOpenPromptModal] = useState(false);
// Texto do prompt selecionado para exibição no modal
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const handleOpenPromptModal = (promptText) => {
    setSelectedPrompt(promptText);
    setOpenPromptModal(true);
  };

  const handleClosePromptModal = () => {
    setOpenPromptModal(false);
    setSelectedPrompt("");
  };

  useEffect(() => {
    fetchTests();
  }, []);

// Carrega todos os testes da API ao iniciar
  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_URL}/tests`);
      if (!response.ok) throw new Error("Erro ao carregar os testes.");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Erro ao buscar testes:", error);
      setFeedback({ open: true, message: "Erro ao carregar os testes." });
    }
  };

// Cria um novo teste com base no prompt e nas opções fornecidas
  const createTest = async () => {
    if (!prompt.trim() || !questionsCount || !questionType || !difficulty || !provider) {
      setFeedback({ open: true, message: "Por favor, preencha todos os campos." });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, questions_count: questionsCount, question_type: questionType, difficulty, provider }),
      });
      if (!response.ok) throw new Error("Erro ao criar teste.");
      setFeedback({ open: true, message: "Teste criado com sucesso!" });
      fetchTests();
      setPrompt("");
    } catch (error) {
      console.error("Erro ao criar teste:", error);
      setFeedback({ open: true, message: "Erro ao criar teste." });
    }
    setLoading(false);
  };

// Exclui um teste da base de dados
  const deleteTest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tests/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir teste.");
      setFeedback({ open: true, message: "Teste excluído com sucesso!" });
      fetchTests();
    } catch (error) {
      console.error("Erro ao excluir teste:", error);
      setFeedback({ open: true, message: "Erro ao excluir teste." });
    }
  };

// Copia o conteúdo de um teste para a área de transferência
  const copyToClipboard = (test) => {
    navigator.clipboard.writeText(JSON.stringify(test, null, 2));
    setFeedback({ open: true, message: "Teste copiado para área de transferência!" });
  };

// Salva as alterações feitas no JSON de perguntas de um teste
  const saveEditedQuestions = async (testId) => {
    try {
      const parsedQuestions = JSON.parse(editedQuestions);
      const response = await fetch(`${API_URL}/tests/${testId}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedQuestions),
      });
      if (!response.ok) throw new Error("Erro ao atualizar questões.");
      setFeedback({ open: true, message: "Questões atualizadas com sucesso!" });
      setEditingQuestionsId(null);
      fetchTests();
    } catch (error) {
      console.error("Erro ao salvar questões editadas:", error);
      setFeedback({ open: true, message: "Erro ao atualizar questões. Verifique o formato JSON." });
    }
  };

// Atualiza a resposta fornecida pelo usuário para uma questão
  const handleAnswerChange = (testId, index, value) => {
    setUserAnswers((prev) => ({ ...prev, [`${testId}-${index}`]: value }));
  };

// Valida as respostas fornecidas pelo usuário, incluindo correção automática
  const validateAnswers = async (testId, questions) => {
    setShowValidation((prev) => ({ ...prev, [testId]: {} }));
    setProcessing((prev) => ({ ...prev, [testId]: true }));

    const results = {};
    let score = 0;
    let total = 0;

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const userAnswer = userAnswers[`${testId}-${idx}`];

      if (q.type.toLowerCase() === "discursiva") {
        try {
          const response = await fetch(`${API_URL}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: q.question,
              correct_answer: q.answer,
              user_answer: userAnswer || ""
            })
          });
          const data = await response.json();
          const thisScore = Math.min(data.score, 1.0);
          results[idx] = thisScore >= 0.9;
          results[`score-${idx}`] = thisScore;
          results[`justification-${idx}`] = data.justification;
          score += thisScore;
          total += 1.0;
        } catch {
          results[idx] = false;
          results[`score-${idx}`] = 0;
          total += 1.0;
        }
      } else {
        const isCorrect = userAnswer === q.answer;
        results[idx] = isCorrect;
        score += isCorrect ? 1.0 : 0.0;
        total += 1.0;
      }
    }

    results.totalScore = score;
    results.totalPossible = total;

    setShowValidation((prev) => ({ ...prev, [testId]: results }));
    setProcessing((prev) => ({ ...prev, [testId]: false }));
  };

  return (
    <Container style={{ padding: "20px", maxWidth: "800px" }}>
      <h1 style={{ color: "#1976D2", textAlign: "center" }}>Gerador de Testes com IA</h1>

      <TextField fullWidth label="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ marginBottom: 10 }} />
      <TextField type="number" label="Número de questões" value={questionsCount} onChange={(e) => setQuestionsCount(Number(e.target.value))} style={{ marginBottom: 10 }} fullWidth />

      <FormControl fullWidth style={{ marginBottom: 10 }}>        
        <InputLabel id="label-question-type">Tipo de questão</InputLabel>
        <Select
          labelId="label-question-type"
          label="Tipo de questão"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          
          <MenuItem value="multiple_choice">Múltipla escolha</MenuItem>
          <MenuItem value="discursive">Discursiva</MenuItem>
          <MenuItem value="mixed">Mista</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel id="label-difficulty">Dificuldade</InputLabel>
        <Select
          labelId="label-difficulty"
          label="Dificuldade"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <MenuItem value="easy">Fácil</MenuItem>
          <MenuItem value="medium">Médio</MenuItem>
          <MenuItem value="hard">Difícil</MenuItem>
        </Select>
      </FormControl>


      <Button onClick={createTest} variant="contained" color="primary" style={{ marginTop: 10 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Criar Teste"}
      </Button>

      {tests.map((test) => (
        <Card key={test.id} style={{ marginTop: 20, backgroundColor: "#f9f9f9" }}>
          <CardContent>

          <Typography
            variant="h6"
            style={{ color: "#1976D2", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => handleOpenPromptModal(test.title)}
          >
            {test.title ? `${test.title.split("\n")[0].slice(0, 80)}${test.title.length > 80 ? '...' : ''}` : 'Prompt não disponível'}
          </Typography>


            {editingQuestionsId === test.id ? (
              <>
                <TextField
                  multiline
                  fullWidth
                  minRows={6}
                  label="Editar questões (formato JSON)"
                  value={editedQuestions}
                  onChange={(e) => setEditedQuestions(e.target.value)}
                  style={{ marginBottom: 10 }}
                />
                <Button onClick={() => saveEditedQuestions(test.id)} variant="contained" color="primary" style={{ marginRight: 10 }}>
                  Salvar
                </Button>
                <Button onClick={() => setEditingQuestionsId(null)} variant="outlined" color="secondary">
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                {(test.questions?.questions || []).map((q, idx) => (
                  <div key={idx} style={{ marginBottom: 20 }}>
                    <Typography variant="subtitle1">{idx + 1}. {q.question}</Typography>
                    {q.type.toLowerCase() === "discursiva" ? (
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder="Digite sua resposta..."
                        value={userAnswers[`${test.id}-${idx}`] || ""}
                        onChange={(e) => handleAnswerChange(test.id, idx, e.target.value)}
                        style={{ marginBottom: 10 }}
                      />
                    ) : (
                      <RadioGroup
                        value={userAnswers[`${test.id}-${idx}`] || ""}
                        onChange={(e) => handleAnswerChange(test.id, idx, e.target.value)}
                      >
                        {q.options.map((opt, i) => (
                          <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                        ))}
                      </RadioGroup>
                    )}
                    {processing[test.id] && <Typography color="textSecondary">Processando resposta...</Typography>}
                    {showValidation[test.id]?.[idx] !== undefined && !processing[test.id] && (
                      <div style={{ marginTop: 8 }}>
                        <Typography color={showValidation[test.id][idx] ? "green" : "red"}>
                          {q.type.toLowerCase() === "discursiva"
                            ? `Nota: ${showValidation[test.id][`score-${idx}`].toFixed(2)}/1.0`
                            : (showValidation[test.id][idx] ? "Resposta correta!" : `Resposta incorreta. Resposta correta: ${q.answer}`)}
                        </Typography>
                        {q.type.toLowerCase() === "discursiva" && showValidation[test.id][`justification-${idx}`] && (
                          <Typography variant="body2" style={{ marginTop: 4 }}>
                            Justificativa: {showValidation[test.id][`justification-${idx}`]}
                          </Typography>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {processing[test.id] && (
                  <div style={{ marginBottom: 16 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="textSecondary">Validando respostas...</Typography>
                  </div>
                )}

                {!processing[test.id] &&
                  showValidation[test.id]?.totalScore !== undefined &&
                  showValidation[test.id]?.totalPossible !== undefined && (
                    <Typography variant="h6" style={{ marginTop: 12, color: "#1976D2" }}>
                      Nota total: {showValidation[test.id].totalScore.toFixed(2)}/{showValidation[test.id].totalPossible.toFixed(2)}
                    </Typography>
                )}

    

                <Button onClick={() => deleteTest(test.id)} color="secondary">Excluir</Button>
                <Button onClick={() => {
                  setEditedQuestions(JSON.stringify(test.questions, null, 2));
                  setEditingQuestionsId(test.id);
                }} style={{ marginLeft: 10 }}>Editar Questões</Button>
                <Button onClick={() => validateAnswers(test.id, test.questions.questions)} style={{ marginLeft: 10 }}>Validar Respostas</Button>
                <IconButton onClick={() => copyToClipboard(test)}><ContentCopyIcon /></IconButton>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ open: false, message: "" })}
        message={feedback.message}
      />

      <Dialog open={openPromptModal} onClose={handleClosePromptModal} maxWidth="md" fullWidth>
        <DialogTitle>Prompt Completo</DialogTitle>
        <DialogContent>
          <Typography style={{ whiteSpace: "pre-wrap" }}>{selectedPrompt}</Typography>
        </DialogContent>
      </Dialog>


    </Container>
  );
}

export default App; 
