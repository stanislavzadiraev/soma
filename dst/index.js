import { writeFile, mkdir, rmdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { userInfo } from 'node:os'

const {uid:UID, gid:GID} = userInfo()

const N = () => undefined

const MKDIR = $ => mkdir($, {recursive: true}).catch(N)
const RMDIR = $ => rmdir($, {recursive: true}).catch(N)

const build = ({
    dbpath = 'database',
    dbname = 'base',
    dbuser = 'user',
    dbword = 'word',
    dbport = '9090',

    fspath = 'fileroot',    
    fsport = '8080',

    fscontent = [
    ],
 }) =>
  Promise.all([
    MKDIR(dbpath),
    MKDIR(fspath),
    Promise.all(fscontent.map(([src, dst]) =>
      Promise.all([
        MKDIR(src),
        MKDIR(join(fspath, dst)),
      ])
    )),
    writeFile(
      'nginx.default.conf',
      `
      server {
          listen ${fsport};

          root /var/www/html/;
          index index.php;

          location / {
              try_files $uri $uri/ =404;
          }

          location ~ \.php$ {
              try_files $uri =404;
              fastcgi_pass php:9000;
              include fastcgi_params;
              fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
              fastcgi_param PATH_INFO $fastcgi_path_info;
          }
      }
      `
    ),
    writeFile(
      'php.dockerfile',
      `
      FROM php:fpm
      RUN docker-php-ext-install mysqli
      `
    ),
    writeFile(
      'docker-compose.yml',
      `
      version: '3.1'

      name: soma
      
      services:

        nginx:
          image: nginx:alpine
          restart: always
          ports:
              - "${fsport}:${fsport}"
          volumes: [
            ./nginx.default.conf:/etc/nginx/conf.d/default.conf,
            ./${fspath}/:/var/www/html/,
            ${fscontent.map(([src, dst])=>`./${src}/:/var/www/html/${dst}/`).join(', ')}
          ]

        php:
          build:
            context: .
            dockerfile: php.dockerfile
          restart: always
          user: "${UID}:${GID}"
          volumes: [ 
            ./${fspath}/:/var/www/html/,
            ${fscontent.map(([src, dst])=>`./${src}/:/var/www/html/${dst}/`).join(', ')}
          ]

        mysql:
          image: mysql:latest
          restart: always
          environment:
            MYSQL_RANDOM_ROOT_PASSWORD: OK
            MYSQL_DATABASE: ${dbname}
            MYSQL_USER: ${dbuser}
            MYSQL_PASSWORD: ${dbword}
          user: "${UID}:${GID}"
          volumes:
            - ./${dbpath}/:/var/lib/mysql/
      
        phpmyadmin:
          image: phpmyadmin:latest
          restart: always
          depends_on:
            mysql:
              condition: service_started
          ports:
            - ${dbport}:80
          environment:
            PMA_HOST: mysql
            PMA_USER: ${dbuser}
            PMA_PASSWORD: ${dbword}
      
      `
    ),
  ])

  const prune = ({
    dbpath = 'database',a
    fspath = 'fileroot',
  }) =>
  Promise.all(
    [fspath, dbpath, 'nginx.default.conf', 'php.dockerfile', 'docker-compose.yml']
    .map(path =>
      rm(path, {force: true, recursive: true})
    )
  )

export default {build, prune}