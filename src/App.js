import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_URL = "http://localhost:8000";

function App() {
  const [prompt, setPrompt] = useState("");
  const [questionsCount, setQuestionsCount] = useState(5);
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: "" });
  const [provider, setProvider] = useState("gemini");
  const [editingQuestionsId, setEditingQuestionsId] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState("");


  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_URL}/tests`);
      if (!response.ok) {
        throw new Error("Erro ao carregar os testes.");
      }
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Erro ao buscar testes:", error);
      setFeedback({ open: true, message: "Erro ao carregar os testes." });
    }
  };

  const createTest = async () => {
    
    if (
      !prompt.trim() ||
      !questionsCount ||
      !questionType ||
      !difficulty ||
      !provider
    ) {
      setFeedback({ open: true, message: "Por favor, preencha todos os campos antes de criar o teste." });
      return;
    }    
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          questions_count: questionsCount,
          question_type: questionType,
          difficulty,
          provider, 
        }),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar teste.");
      }
      setFeedback({ open: true, message: "Teste criado com sucesso!" });
      fetchTests();
      setPrompt("");
    } catch (error) {
      console.error("Erro ao criar teste:", error);
      setFeedback({ open: true, message: "Erro ao criar teste." });
    }
    setLoading(false);
  };

  const deleteTest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao excluir teste.");
      }
      setFeedback({ open: true, message: "Teste excluído com sucesso!" });
      fetchTests();
    } catch (error) {
      console.error("Erro ao excluir teste:", error);
      setFeedback({ open: true, message: "Erro ao excluir teste." });
    }
  };

  const copyToClipboard = (test) => {
    navigator.clipboard.writeText(JSON.stringify(test, null, 2));
    setFeedback({ open: true, message: "Teste copiado para área de transferência!" });
  };

  const saveEditedQuestions = async (testId) => {
    try {
      const parsedQuestions = JSON.parse(editedQuestions);
      const response = await fetch(`${API_URL}/tests/${testId}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedQuestions),
      });
  
      if (!response.ok) {
        throw new Error("Erro ao atualizar questões.");
      }
  
      setFeedback({ open: true, message: "Questões atualizadas com sucesso!" });
      setEditingQuestionsId(null);
      fetchTests();
    } catch (error) {
      console.error("Erro ao salvar questões editadas:", error);
      setFeedback({ open: true, message: "Erro ao atualizar questões. Verifique o formato JSON." });
    }
  };
  

  return (
    <Container style={{ padding: "20px", maxWidth: "800px" }}>
      <h1 style={{ color: "#1976D2", textAlign: "center" }}>
        Gerador de Testes com IA
      </h1>

      <TextField
        fullWidth
        label="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <TextField
        type="number"
        label="Número de questões"
        value={questionsCount}
        onChange={(e) => setQuestionsCount(Number(e.target.value))}
        style={{ marginBottom: 10 }}
        fullWidth
      />

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel>Tipo de questão</InputLabel>
        <Select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          <MenuItem value="multiple_choice">Múltipla escolha</MenuItem>
          <MenuItem value="discursive">Discursiva</MenuItem>
          <MenuItem value="mixed">Mista</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel>Dificuldade</InputLabel>
        <Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <MenuItem value="easy">Fácil</MenuItem>
          <MenuItem value="medium">Médio</MenuItem>
          <MenuItem value="hard">Difícil</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel>IA Provedora</InputLabel>
        <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <MenuItem value="gemini">Google Gemini</MenuItem>
          <MenuItem value="openai">OpenAI (GPT)</MenuItem>
        </Select>
      </FormControl>

      <Button
        onClick={createTest}
        variant="contained"
        color="primary"
        style={{ marginTop: 10 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Criar Teste"}
      </Button>

      {tests.length === 0 ? (
        <p style={{ marginTop: 20, textAlign: "center", color: "#666" }}>
          Não existem testes cadastrados!
        </p>
      ) : (
        tests.map((test) => (
          <Card key={test.id} style={{ marginTop: 10, backgroundColor: "#f9f9f9" }}>
            {/* <CardContent>
              <h2 style={{ color: "#1976D2" }}>{test.title}</h2>
              <pre style={{ backgroundColor: "#eee", padding: 10, borderRadius: 5 }}>
                {JSON.stringify(test.questions, null, 2)}
              </pre>
              <Button onClick={() => deleteTest(test.id)} color="secondary">
                Excluir
              </Button>
              <IconButton onClick={() => copyToClipboard(test)}>
                <ContentCopyIcon />
              </IconButton>
            </CardContent> */}

            <CardContent>
              <h2 style={{ color: "#1976D2" }}>{test.title}</h2>

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
                  <Button
                    onClick={() => saveEditedQuestions(test.id)}
                    variant="contained"
                    color="primary"
                    style={{ marginRight: 10 }}
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingQuestionsId(null)}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <pre style={{ backgroundColor: "#eee", padding: 10, borderRadius: 5 }}>
                    {JSON.stringify(test.questions, null, 2)}
                  </pre>
                  <Button onClick={() => deleteTest(test.id)} color="secondary">
                    Excluir
                  </Button>
                  <Button
                    onClick={() => {
                      setEditedQuestions(JSON.stringify(test.questions, null, 2));
                      setEditingQuestionsId(test.id);
                    }}
                    style={{ marginLeft: 10 }}
                  >
                    Editar Questões
                  </Button>
                  <IconButton onClick={() => copyToClipboard(test)}>
                    <ContentCopyIcon />
                  </IconButton>
                </>
              )}
            </CardContent>







          </Card>
        ))
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ open: false, message: "" })}
        message={feedback.message}
      />
    </Container>
  );
}

export default App;
