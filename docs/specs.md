# Workflow for Creating a New Endpoint in FinApp Backend

## Overview

This document outlines the step-by-step process for creating a new endpoint in the FinApp backend application. The application follows a layered architecture with domain-driven design principles, using NestJS framework, Prisma ORM, and TypeScript.

## Understanding the Domain Models

### Transaction Model

- **Fields**: id, description, amount, type (income/expense/investment), dueDate, categoryId, createdAt, updatedAt
- **Relationships**: Belongs to Category via categoryId
- **Purpose**: Represents financial transactions with categorization

### Category Model

- **Fields**: id, title, slug, color, createdAt, updatedAt
- **Relationships**: Has many Transactions
- **Purpose**: Groups transactions by category (e.g., "Supermarket", "Salary")

## Step-by-Step Workflow

### 1. Define Requirements

- Clearly specify the endpoint's purpose and expected behavior
- Identify input/output data structures
- Determine authentication/authorization requirements
- Consider edge cases and error scenarios

### 2. Create DTOs (Data Transfer Objects)

Create appropriate DTOs in `src/types/` directory:

- **Request DTO**: For input validation (e.g., `CreateTransactionDTO`, `UpdateTransactionDTO`)
- **Response DTO**: For output formatting (e.g., `TransactionDTO`)
- **Filter/Query DTOs**: For search/filtering parameters

Example location: `src/types/transactions/createTransactionDTO.ts`

### 3. Implement Repository Layer

If new data access methods are needed:

- Add abstract methods to the repository interface (e.g., `TransactionsRepository`)
- Implement concrete methods in database repository (e.g., `db.transactions.repository.ts`)
- Optionally implement in-memory version for testing (e.g., `memo.transactions.repository.ts`)

### 4. Implement Service Layer

Create or update service class in `src/services/`:

- Inject required repositories
- Implement business logic
- Handle validation and error cases
- Return appropriate DTOs

### 5. Implement Controller Layer

Create or update controller in `src/controllers/`:

- Define route handlers with appropriate HTTP methods
- Use DTOs for request/response
- Implement parameter validation
- Handle HTTP status codes and responses

### 6. Update Module Configuration

Ensure the new components are properly registered in the relevant module (e.g., `TransactionsModule`):

- Import new services, controllers
- Configure dependencies
- Update exports if needed

## Testing Standards and Coverage

### Test Structure

The application uses Jest with NestJS testing utilities. Tests are organized by layer:

- **Controller Tests**: `*.controller.spec.ts`
- **Service Tests**: `*.service.spec.ts`
- **Repository Tests**: `*.repository.spec.ts` (where applicable)

### Unit Testing Guidelines

#### Controller Tests

- Mock all dependencies (services, repositories)
- Test HTTP request/response handling
- Cover success scenarios
- Test error cases (404, 400, etc.)
- Verify service method calls
- Example: `transactions.controller.spec.ts`

#### Service Tests

- Mock repository dependencies
- Test business logic implementation
- Cover validation logic
- Test error propagation
- Verify repository method calls
- Example: `transactions.service.spec.ts`

#### Repository Tests

- Test database interactions
- Mock Prisma client where possible
- Test query building and execution
- Cover edge cases in data retrieval

### Test Coverage Requirements

- **Minimum Coverage**: 80% overall
- **Critical Paths**: 100% coverage for main business logic
- **Error Handling**: Test all error scenarios
- **Edge Cases**: Test boundary conditions and unusual inputs

### Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Structure tests clearly
2. **Descriptive Test Names**: Use clear, descriptive test descriptions
3. **Mock External Dependencies**: Isolate unit under test
4. **Test Data**: Use consistent mock data across tests
5. **Schema Validation**: Test against defined schemas (e.g., `transactionSchema`)
6. **Async Testing**: Properly handle promises and async operations

### Integration Testing

- Test end-to-end flows where appropriate
- Use test database for integration tests
- Cover API contract validation
- Test database constraints and relationships

## Code Quality Standards

### TypeScript Best Practices

- Use strict type checking
- Avoid `any` types
- Implement proper interfaces
- Use enums for fixed values (e.g., `TransactionType`)

### Error Handling

- Use NestJS exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Provide meaningful error messages
- Log errors appropriately
- Handle database errors gracefully

### Validation

- Use class-validator decorators on DTOs
- Implement custom validators where needed
- Validate input at controller level
- Sanitize data before processing

## Deployment and Documentation

### API Documentation

- Update OpenAPI/Swagger documentation
- Document request/response examples
- Include error response formats
- Specify authentication requirements

### Database Migrations

- Create Prisma migrations for schema changes
- Test migrations on development database
- Update seed data if needed
- Verify data integrity after migrations

### Environment Configuration

- Add new environment variables if required
- Update configuration files
- Document configuration options

## Checklist for New Endpoint Creation

- [ ] Requirements defined and approved
- [ ] DTOs created and validated
- [ ] Repository methods implemented
- [ ] Service logic implemented
- [ ] Controller endpoints implemented
- [ ] Module configuration updated
- [ ] Unit tests written (controllers, services, repositories)
- [ ] Integration tests written
- [ ] Test coverage verified (>80%)
- [ ] Error handling tested
- [ ] API documentation updated
- [ ] Database migrations created (if applicable)
- [ ] Code reviewed
- [ ] Manual testing completed
- [ ] Deployed to staging and tested

## Example: Creating a New Transaction Endpoint

1. **Define DTOs**: `CreateTransactionDTO`, `TransactionDTO`
2. **Repository**: Add `create()` method to `TransactionsRepository`
3. **Service**: Implement `create()` in `TransactionsService`
4. **Controller**: Add `POST /transactions` endpoint
5. **Tests**: Write controller and service tests
6. **Module**: Ensure dependencies are injected
7. **Validation**: Test with various inputs and edge cases

This workflow ensures consistent, testable, and maintainable code across the application.
