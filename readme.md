# Локальный Nginx PHP SQL
## Подготовка системы
### Docker
```sh
# установка
sudo snap install docker --classic

#подготовка
sudo groupadd docker
sudo usermod --append --groups docker $USER
# точно требуется выход пользователя из истемы
# возможно требуется презагрузка системы
```
###  NodeJS
```sh
# установка
sudo snap install node --classic
```
## Подготовка проекта
`package.json`
 ```js
/// Установка
  "devDependencies": {
    ///...
    "soma": "github:stanislavzadiraev/soma",
    ///...
  },
///...

/// Подключение
  "scripts": {
    ///...
    "soma": "soma",
    ///...
  },
///...
```
## Работа пакета
### Конфигурация
`soma.config.js`

файл конфигурации  с минимальным числом параметров
```js
export default {
}
```
файл конфигурации с максимальным числом параметров
```js
export default {

    // точка монтирования в проект файловой системы MySQL 
    dbpath: 'database',
 
    // параметры MySQL
    dbname: 'base',
    dbuser: 'user',
    dbword: 'word',
 
    // порт доступа PHPmyAdminer
    dbport: '9090',

    //точка монтирования в проект файловой системы Nginx
    fspath: 'fileroot',
 
    // порт доступа Nginx
    fsport: '8080',
 
    // точки монтирования прочих файловых подсистем
    fscontent: [
        ['next', 'next'],
    ],

}
```
### Выполнение
```sh
#создание окружения
npm run soma build

#удаление окружения
npm run soma prune
```
### Окружение
- файл конфигурации Docker Compose
- файл конфигурации Nginx
- файловая подсистема Nginx
- файловая подсистема MySQL
- прочие файловые подсистемы