from celery import Celery

celery_app = Celery(
    "acme_recruitment",
    broker = "redis://localhost:6379/0",
    backend = "redis://localhost:6379/0"
)

@celery_app.task
def req_approval_task(requisition_data):
    # Simulate a time-consuming task
    import time
    time.sleep(5)  # Simulate delay

   

    # Here you would add logic to create the requisition in the database
    # For example:
    # db = SessionLocal()
    # new_req = Requisition(**requisition_data)
    # db.add(new_req)
    # db.commit()
    # db.refresh(new_req)
    # db.close()

    return f"Requisition for {requisition_data['position']} Approved by ACME Manager!"