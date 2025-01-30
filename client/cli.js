const fs = require("fs");
const inquirer = require("inquirer").default;
const axios = require("axios");
const API_URL = "http://localhost:5000/api";

const SESSION_FILE = "session.txt";
let sessionID = null;

function loadSession() {
  if (fs.existsSync(SESSION_FILE)) {
    sessionID = fs.readFileSync(SESSION_FILE, "utf8").trim();
    console.log(" Используем сохраненный sessionID:", sessionID);
  }
}

function saveSession(id) {
  fs.writeFileSync(SESSION_FILE, id, "utf8");
}

async function startSession() {
  loadSession();
  if (!sessionID) {
    const res = await axios.post(`${API_URL}/session`);
    sessionID = res.data.sessionID;
    saveSession(sessionID);
    console.log(" Создана новая сессия:", sessionID);
  }
}

async function createWallet() {
  await axios.post(`${API_URL}/wallet`, { sessionID });
  console.log(" Кошелек создан!");
}
async function lookWallet() {
  try {
    const { data: wallets } = await axios.get(`${API_URL}/wallet/${sessionID}`);
    console.log(" Ваши кошельки:");
    wallets.forEach(w => console.log(`Адрес: ${w.address}, Баланс: ${w.balance}`));
  } catch (error) {
    console.error(" Ошибка при получении кошельков:", error.response?.data || error.message);
  }
}


async function transferMoney() {
  try {
    // Получаем кошельки текущего пользователя
    const { data: userWallets } = await axios.get(`${API_URL}/wallet/${sessionID}`);

    if (userWallets.length < 1) {
      console.log("У вас нет кошельков для отправки!");
      return;
    }

    // Выбор кошелька, с которого отправляем
    const { fromWallet } = await inquirer.prompt([
      {
        type: "list",
        name: "fromWallet",
        choices: userWallets.map(w => ({ name: `${w.address} (Баланс: ${w.balance})`, value: w.address })),
        message: "Выберите кошелек для отправки денег"
      }
    ]);

    // Получаем **все** кошельки из базы
    const { data: allWallets } = await axios.get(`${API_URL}/wallet`);

    // Фильтруем только тот же кошелек (но оставляем другие кошельки пользователя)
    const availableWallets = allWallets.filter(w => w.address !== fromWallet);

    if (availableWallets.length === 0) {
      console.log(" Нет доступных кошельков для перевода!");
      return;
    }

    // Выбор кошелька-получателя
    const { toWallet } = await inquirer.prompt([
      {
        type: "list",
        name: "toWallet",
        choices: availableWallets.map(w => ({ name: `${w.address} (Баланс: ${w.balance})`, value: w.address })),
        message: "Выберите кошелек для получения денег"
      }
    ]);

    // Ввод суммы
    const { amount } = await inquirer.prompt([
      { name: "amount", message: "Введите сумму перевода" }
    ]);

    // Отправка запроса на перевод
    await axios.post(`${API_URL}/transfer`, { fromWallet, toWallet, amount: Number(amount) });

    console.log(` Успешный перевод ${amount} от ${fromWallet} к ${toWallet}!`);
  } catch (error) {
    console.error(" Ошибка при переводе:", error.response?.data || error.message);
  }
}



async function menu() {
  await startSession();
  while (true) {
    const { choice } = await inquirer.prompt([{ type: "list", name: "choice", choices: ["Создать кошелек", "Посмотреть кошельки", "Перевести деньги", "Выход"] }]);
    if (choice === "Создать кошелек") await createWallet();
    else if (choice === "Перевести деньги") await transferMoney();
    else if (choice === "Посмотреть кошельки") await lookWallet();
    else process.exit();
  }
}

menu();
