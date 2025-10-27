import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

export const getTransactionalRepository = <T extends ObjectLiteral>(
  repository: Repository<T>,
  transactionalEntityManager?: EntityManager,
): Repository<T> => {
  return transactionalEntityManager
    ? transactionalEntityManager.getRepository(repository.target)
    : repository;
};
