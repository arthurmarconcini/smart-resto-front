import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useUploadAnotaAiReport, type UploadAnotaAiResponse } from "@/hooks/useSales";

export function AnotaAiUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<UploadAnotaAiResponse | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadReport, isPending } = useUploadAnotaAiReport();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg(null);
    setResult(null);

    // Validate extension
    if (!selectedFile.name.endsWith(".xlsx")) {
      setErrorMsg("Formato inválido. Selecione um arquivo .xlsx");
      setFile(null);
      return;
    }

    // Validate size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("Arquivo muito grande. O tamanho máximo é 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetUpload = () => {
    clearFile();
    setResult(null);
    setProgress(0);
    setShowErrors(false);
  };

  const handleUpload = () => {
    if (!file) return;

    setErrorMsg(null);
    
    // Simulate progress
    setProgress(10);
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    uploadReport(file, {
      onSuccess: (data) => {
        clearInterval(progressInterval);
        setProgress(100);
        setResult(data);
      },
      onError: (error: unknown) => {
        clearInterval(progressInterval);
        setProgress(0);
        const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
        const message = axiosError.response?.data?.error || axiosError.response?.data?.message || "Erro ao processar o arquivo.";
        setErrorMsg(message);
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // State: Success result
  if (result) {
    return (
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <CardTitle>Importação Concluída</CardTitle>
          </div>
          <CardDescription>
            O relatório do Anota Aí foi processado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center border border-border">
              <span className="text-3xl font-bold font-heading">{result.totalProcessado}</span>
              <span className="text-sm text-muted-foreground mt-1">Linhas Processadas</span>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg flex flex-col items-center justify-center border border-primary/20">
              <span className="text-3xl font-bold font-heading text-primary">{result.vendasCriadas}</span>
              <span className="text-sm text-primary/80 mt-1">Vendas Criadas</span>
            </div>
            <div className={`p-4 rounded-lg flex flex-col items-center justify-center border ${result.erros > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/50 border-border'}`}>
              <span className={`text-3xl font-bold font-heading ${result.erros > 0 ? 'text-destructive' : 'text-foreground'}`}>{result.erros}</span>
              <span className={`text-sm mt-1 ${result.erros > 0 ? 'text-destructive/80' : 'text-muted-foreground'}`}>Erros Encontrados</span>
            </div>
          </div>

          {result.erros > 0 && result.detalhesErros && result.detalhesErros.length > 0 && (
            <div className="border border-destructive/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowErrors(!showErrors)}
                className="w-full flex items-center justify-between p-4 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Ver detalhes dos erros</span>
                </div>
                {showErrors ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              
              {showErrors && (
                <div className="bg-background border-t border-destructive/20 p-0">
                  <ScrollArea className="h-[250px] w-full">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground w-20">Linha</th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">Erro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.detalhesErros.map((erro, index) => (
                          <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/50">
                            <td className="px-4 py-2 font-mono text-muted-foreground">{erro.linha}</td>
                            <td className="px-4 py-2 text-destructive">{erro.erro}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={resetUpload} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Fazer Nova Importação
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: Default / Uploading / Error
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Importar Relatório de Vendas</CardTitle>
        <CardDescription>
          Faça upload da planilha de vendas do Anota Aí (.xlsx) para importar os dados automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div 
          className={`
            border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-muted/10'}
            ${isPending ? 'opacity-80 pointer-events-none' : 'hover:border-primary/50 hover:bg-muted/30 cursor-pointer'}
            ${file && !isPending ? 'border-primary/30 bg-primary/5' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && !isPending && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx" 
            className="hidden" 
          />
          
          {isPending ? (
            <div className="w-full max-w-md mx-auto space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Processando importação...</p>
                <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
              </div>
              <Progress value={progress} className="h-2 w-full" />
            </div>
          ) : file ? (
            <div className="w-full max-w-md flex items-center gap-4 bg-background p-4 rounded-lg border border-border shadow-sm" onClick={(e) => e.stopPropagation()}>
              <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
                <span className="sr-only">Remover arquivo</span>
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2 pointer-events-none">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">
                Arraste o arquivo .xlsx aqui ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Apenas arquivos .xlsx até 10MB
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={!file || isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Importando..." : "Importar Vendas"}
          </Button>
        </div>
        
      </CardContent>
    </Card>
  );
}
