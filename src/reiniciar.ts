// reiniciar.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de configuração de ambiente
const ENV_CONFIG_FILE = path.join(process.cwd(), '.env-config.json');

// Função para reiniciar o servidor NestJS
function reiniciarServidor() {
  console.log('Reiniciando o servidor NestJS...');

  // Verificar se o arquivo de configuração existe
  if (fs.existsSync(ENV_CONFIG_FILE)) {
    try {
      // Ler a configuração do ambiente
      const config = JSON.parse(fs.readFileSync(ENV_CONFIG_FILE, 'utf8'));
      console.log(`Ambiente configurado: ${config.nodeEnv}`);

      // Configurar o ambiente para o novo processo
      const env = { ...process.env, NODE_ENV: config.nodeEnv };

      // Iniciar um novo processo para a aplicação NestJS
      const nestProcess = spawn('node', ['dist/src/main.js'], {
        env,
        detached: true,
        stdio: 'inherit',
      });

      // Desvincula o processo filho para que ele continue executando independentemente
      nestProcess.unref();

      console.log(`Novo processo NestJS iniciado com PID: ${nestProcess.pid}`);
      console.log('Reinicialização concluída!');

      // Encerrar este processo depois de iniciar o novo
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (erro) {
      console.error('Erro ao reiniciar o servidor:', erro);
      process.exit(1);
    }
  } else {
    console.log(
      'Arquivo de configuração não encontrado. Usando ambiente padrão.',
    );

    // Iniciar com ambiente padrão
    const nestProcess = spawn('node', ['dist/src/main.js'], {
      detached: true,
      stdio: 'inherit',
    });

    nestProcess.unref();
    console.log(`Novo processo NestJS iniciado com PID: ${nestProcess.pid}`);

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Executar a reinicialização
reiniciarServidor();
