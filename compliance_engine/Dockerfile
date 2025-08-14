FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY pyproject.toml uv.lock ./
COPY README.md ./

# Install uv for faster dependency management
RUN pip install uv

# Install dependencies
RUN uv sync --frozen

# Copy source code
COPY src/ ./src/
COPY ontologies/ ./ontologies/
COPY shapes/ ./shapes/

# Create non-root user
RUN useradd --create-home --shell /bin/bash compliance
RUN chown -R compliance:compliance /app
USER compliance

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uv", "run", "uvicorn", "src.compliance_engine.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 