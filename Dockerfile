# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copia package files
COPY package.json bun.lockb ./

# Instala dependências
RUN bun install

# Copia o código fonte
COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Build da aplicação
RUN bun run build

# Stage 2: Runtime
FROM nginx:alpine

# Copia arquivos built do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Cria diretório de logs
RUN mkdir -p /var/log/nginx && chmod -R 755 /var/log/nginx

# Verifica se a pasta dist existe e tem arquivos
RUN ls -la /usr/share/nginx/html/ || echo "Warning: dist folder is empty"

# Expõe a porta
EXPOSE 4001

# Comando para iniciar nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
