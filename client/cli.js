const inquirer = require("inquirer").default;
const axios = require("axios");
const API_URL = "http://localhost:5000/api";

let sessionID = null;

async function startSession() {
  const res = await axios.post(`${API_URL}/session`);
  sessionID = res.data.sessionID; // Сохраняем sessionID
  console.log("Session started:", sessionID); // Выведем sessionID в консоль для отладки
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
    const { data: wallets } = await axios.get(`${API_URL}/wallet/${sessionID}`);

    if (wallets.length < 2) {
      console.log(" Нужно минимум два кошелька для перевода!");
      return;
    }

    // Выбор кошелька, с которого отправляем
    const { fromWallet } = await inquirer.prompt([
      {
        type: "list",
        name: "fromWallet",
        choices: wallets.map(w => ({ name: `${w.address} (Баланс: ${w.balance})`, value: w.address })),
        message: "Выберите кошелек для отправки денег"
      }
    ]);

    // Фильтруем кошельки, чтобы исключить выбранный для отправки
    const availableWallets = wallets.filter(w => w.address !== fromWallet);

    if (availableWallets.length === 0) {
      console.log(" Нет доступных кошельков для перевода!");
      return;
    }

    // Выбор кошелька, на который отправляем
    const { toWallet } = await inquirer.prompt([
      {
        type: "list",
        name: "toWallet",
        choices: availableWallets.map(w => ({ name: `${w.address} (Баланс: ${w.balance})`, value: w.address })),
        message: "Выберите кошелек для получения денег"
      }
    ]);

    // Ввод суммы перевода
    const { amount } = await inquirer.prompt([
      { name: "amount", message: "Введите сумму перевода" }
    ]);

    // Запрос на перевод
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
