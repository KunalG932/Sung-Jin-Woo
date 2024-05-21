FROM node:18


WORKDIR "/Sung"

RUN npm install telegraf
RUN npm install mongodb


COPY . .

CMD [ "node", "Sung/index" ]