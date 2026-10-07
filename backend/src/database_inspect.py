from sqlalchemy import create_engine, MetaData

from sqlalchemy import create_engine, MetaData

DATABASE_URL = "postgresql://postgres:1234@localhost:5432/gen_ai_db"

engine = create_engine(DATABASE_URL)

metadata = MetaData()
metadata.reflect(bind=engine)

print("\n" + "=" * 80)
print("DATABASE SCHEMA")
print("=" * 80)

for table_name, table in metadata.tables.items():

    print(f"\nTABLE: {table_name}")
    print("-" * 60)

    # Columns
    print("Columns:")

    for column in table.columns:
        primary_key = " PK" if column.primary_key else ""

        print(
            f"  {column.name:<30} "
            f"{str(column.type):<20} "
            f"nullable={column.nullable}"
            f"{primary_key}"
        )

    # Foreign Keys
    print("\nForeign Keys:")

    if table.foreign_keys:
        for fk in table.foreign_keys:
            print(
                f"  {fk.parent} -> "
                f"{fk.column.table.name}.{fk.column.name}"
            )
    else:
        print("  None")


# Print all relationships separately
print("\n" + "=" * 80)
print("RELATIONSHIPS")
print("=" * 80)

for table_name, table in metadata.tables.items():

    for fk in table.foreign_keys:

        source_table = fk.parent.table.name
        source_column = fk.parent.name

        target_table = fk.column.table.name
        target_column = fk.column.name

        print(
            f"{source_table}.{source_column}"
            f"  --->  "
            f"{target_table}.{target_column}"
        )

engine = create_engine(DATABASE_URL)

metadata = MetaData()
metadata.reflect(bind=engine)

print(metadata.tables.keys())